import type { Notification, Pool, PoolClient } from "pg";

/**
 * Callback invoked when a message is received on a channel.
 *
 * @template T - Message payload type.
 */
export type MessageCallback<T = unknown> = (message: T) => void;

/**
 * Lightweight PostgreSQL pub/sub wrapper using `pg_notify`.
 *
 * Each subscribed channel uses a dedicated PostgreSQL client
 * connection listening for notifications.
 *
 * @example
 * ```ts
 * const pubsub = new PostgresPubSub(pool);
 *
 * await pubsub.subscribe<{ text: string }>("chat", (msg) => {
 *   console.log(msg.text);
 * });
 *
 * await pubsub.publish("chat", { text: "hello" });
 * ```
 */
export class PostgresPubSub {
    private readonly pool: Pool;
    private readonly listeners: Map<string, PoolClient>;

    /**
     * Creates a new pub/sub instance.
     *
     * @param pool - Connected PostgreSQL pool instance.
     */
    constructor(pool: Pool) {
        this.pool = pool;
        this.listeners = new Map();
    }

    /**
     * Publishes a message to a PostgreSQL channel.
     *
     * Messages are serialized as JSON before sending.
     *
     * @template T - Message payload type.
     * @param channel - Channel name.
     * @param message - JSON-serializable message payload.
     * @returns Resolves when the notification has been sent.
     *
     * @example
     * ```ts
     * await pubsub.publish("events", { type: "USER_CREATED" });
     * ```
     */
    async publish<T>(channel: string, message: T): Promise<void> {
        const payload = JSON.stringify(message);

        await this.pool.query("SELECT pg_notify($1, $2)", [channel, payload]);
    }

    /**
     * Subscribes to a channel and registers a callback.
     *
     * The callback is invoked whenever a notification is received.
     *
     * Channel names must be trusted or validated before calling,
     * as PostgreSQL does not allow parameterized identifiers for `LISTEN`.
     *
     * @template T - Expected message payload type.
     * @param channel - Channel name.
     * @param callback - Handler invoked for incoming messages.
     * @returns Resolves once the listener is active.
     *
     * @example
     * ```ts
     * await pubsub.subscribe<{ id: string }>("users", (msg) => {
     *   console.log(msg.id);
     * });
     * ```
     */
    async subscribe<T>(channel: string, callback: MessageCallback<T>): Promise<void> {
        const client = await this.pool.connect();

        await client.query(`LISTEN ${channel}`);

        client.on("notification", (msg: Notification) => {
            if (msg.channel !== channel || !msg.payload) {
                return;
            }

            try {
                const parsed = JSON.parse(msg.payload) as T;
                callback(parsed);
            } catch (error) {
                console.error(`[PostgresPubSub] Failed to parse message on ${channel}:`, error);
            }
        });

        this.listeners.set(channel, client);
    }

    /**
     * Unsubscribes from a channel.
     *
     * Stops listening and releases the underlying database client.
     *
     * @param channel - Channel name.
     * @returns Resolves when the listener is removed.
     *
     * @example
     * ```ts
     * await pubsub.unsubscribe("events");
     * ```
     */
    async unsubscribe(channel: string): Promise<void> {
        const client = this.listeners.get(channel);
        if (!client) {
            return;
        }

        await client.query(`UNLISTEN ${channel}`);
        client.release();

        this.listeners.delete(channel);
    }
}

export default PostgresPubSub;
