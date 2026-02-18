import type { Pool, QueryResultRow } from "pg";

/**
 * Cache row stored in PostgreSQL.
 *
 * @template TValue - Cached value type.
 */
export interface CacheEntry<TValue = unknown> extends QueryResultRow {
    key: string;
    value: TValue;
    expires_at: Date;
}

/**
 * Result returned by {@link PostgresCache.getOrSet}.
 *
 * @template TValue - Cached value type.
 */
export interface CacheResult<TValue> {
    /**
     * Cached or freshly computed value.
     */
    value: TValue;

    /**
     * Indicates whether the value came from cache.
     */
    hit: boolean;

    /**
     * Indicates whether the returned value is stale.
     */
    stale: boolean;
}

/**
 * PostgreSQL-backed key/value cache with TTL and stale-while-revalidate support.
 *
 * Values are stored as JSONB. Expired values may optionally be returned
 * while a refresh occurs in the background.
 *
 * @example
 * ```ts
 * const cache = new PostgresCache(pool);
 *
 * await cache.set("user:1", { name: "Alice" }, 300);
 *
 * const user = await cache.get<{ name: string }>("user:1");
 * console.log(user?.name);
 * ```
 */
export class PostgresCache {
    private readonly pool: Pool;

    /**
     * Creates a new cache instance.
     *
     * @param pool - Connected PostgreSQL pool instance.
     */
    constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Retrieves a value if it exists and has not expired.
     *
     * @template TValue - Expected value type.
     * @param key - Cache key.
     * @returns Cached value or `undefined`.
     *
     * @example
     * ```ts
     * const session = await cache.get<{ userId: string }>("session:abc");
     * ```
     */
    async get<TValue = unknown>(key: string): Promise<TValue | undefined> {
        const result = await this.pool.query<{ value: TValue }>(
            `
      SELECT value
      FROM cache
      WHERE key = $1
        AND expires_at > NOW()
      `,
            [key]
        );

        return result.rows[0]?.value;
    }

    /**
     * Retrieves a cache entry even if expired.
     *
     * @template TValue - Expected value type.
     * @param key - Cache key.
     * @returns Cache entry or `undefined`.
     */
    private async getRaw<TValue = unknown>(key: string): Promise<CacheEntry<TValue> | undefined> {
        const result = await this.pool.query<CacheEntry<TValue>>(
            `
      SELECT key, value, expires_at
      FROM cache
      WHERE key = $1
      `,
            [key]
        );

        return result.rows[0];
    }

    /**
     * Stores or updates a cached value.
     *
     * @template TValue - Value type.
     * @param key - Cache key.
     * @param value - JSON-serializable value.
     * @param ttlSeconds - Time-to-live in seconds.
     * @returns Resolves when the value is written.
     *
     * @example
     * ```ts
     * await cache.set("settings", { theme: "dark" }, 600);
     * ```
     */
    async set<TValue>(key: string, value: TValue, ttlSeconds = 3600): Promise<void> {
        await this.pool.query(
            `
      INSERT INTO cache (key, value, expires_at)
      VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 second'))
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          expires_at = EXCLUDED.expires_at
      `,
            [key, value, ttlSeconds]
        );
    }

    /**
     * Deletes a cached value.
     *
     * @param key - Cache key.
     * @returns Resolves when deletion completes.
     */
    async delete(key: string): Promise<void> {
        await this.pool.query(
            `
      DELETE FROM cache
      WHERE key = $1
      `,
            [key]
        );
    }

    /**
     * Removes expired cache entries.
     *
     * @returns Resolves when cleanup completes.
     *
     * @example
     * ```ts
     * await cache.cleanup();
     * ```
     */
    async cleanup(): Promise<void> {
        await this.pool.query(
            `
      DELETE FROM cache
      WHERE expires_at < NOW()
      `
        );
    }

    /**
     * Refreshes a cache value asynchronously.
     *
     * Errors are intentionally swallowed so background refresh
     * does not affect callers.
     *
     * @template TValue - Cached value type.
     * @param key - Cache key.
     * @param factory - Function used to generate fresh values.
     * @param ttlSeconds - TTL for the refreshed value.
     * @returns Promise that resolves when refresh completes.
     */
    private async scheduleRefresh<TValue>(key: string, factory: () => Promise<TValue>, ttlSeconds: number): Promise<void> {
        const fresh = await factory();
        await this.set(key, fresh, ttlSeconds);
    }

    /**
     * Retrieves a cached value or computes and stores it.
     *
     * Supports stale-while-revalidate behavior:
     *
     * - Fresh cache → returns immediately.
     * - Missing cache → computes value.
     * - Stale cache:
     *   - Returns stale value immediately.
     *   - Refreshes asynchronously.
     *
     * @template TValue - Value type.
     * @param key - Cache key.
     * @param factory - Function used to generate fresh values.
     * @param ttlSeconds - TTL for newly stored values.
     * @param allowStale - Whether stale values may be returned.
     * @returns Cache result containing value + metadata.
     *
     * @example
     * ```ts
     * const result = await cache.getOrSet(
     *   "stats",
     *   async () => fetchStats(),
     *   300,
     *   true
     * );
     *
     * console.log(result.value, result.stale);
     * ```
     */
    async getOrSet<TValue>(key: string, factory: () => Promise<TValue>, ttlSeconds = 3600, allowStale = true): Promise<CacheResult<TValue>> {
        const row = await this.getRaw<TValue>(key);

        if (!row) {
            const value = await factory();
            await this.set(key, value, ttlSeconds);

            return {
                value,
                hit: false,
                stale: false,
            };
        }

        const isStale = row.expires_at <= new Date();

        if (!isStale) {
            return {
                value: row.value,
                hit: true,
                stale: false,
            };
        }

        if (!allowStale) {
            const value = await factory();
            await this.set(key, value, ttlSeconds);

            return {
                value,
                hit: false,
                stale: false,
            };
        }

        this.scheduleRefresh<TValue>(key, factory, ttlSeconds).catch(() => {
            // intentionally ignored
        });

        return {
            value: row.value,
            hit: true,
            stale: true,
        };
    }
}

export default PostgresCache;
