import { randomUUID } from "node:crypto";
import type { Pool, QueryResultRow } from "pg";

/**
 * Represents a job stored in the queue.
 *
 * @template TPayload - JSON payload type stored with the job.
 */
export interface Job<TPayload = unknown> extends QueryResultRow {
    id: number;
    queue: string;
    payload: TPayload;
    attempts: number;
    max_attempts: number;
    scheduled_at: Date;
    locked_at: Date | null;
    lock_token: string | null;
}

/**
 * Job returned from dequeue operations.
 *
 * Includes a lock token required to complete, retry, or fail the job.
 *
 * @template TPayload - Payload type.
 */
export type LeasedJob<TPayload = unknown> = Job<TPayload> & {
    lockToken: string;
};

/**
 * PostgreSQL-backed durable job queue using visibility-timeout leasing.
 *
 * Workers lease jobs for a fixed duration. If a worker crashes,
 * the lease expires and another worker may safely retry the job.
 *
 * This design allows safe horizontal scaling with multiple workers.
 *
 * @example
 * ```ts
 * const queue = new PostgresQueue(pool);
 *
 * const job = await queue.dequeue<{ email: string }>("emails");
 * if (!job) return;
 *
 * try {
 *   await sendEmail(job.payload.email);
 *   await queue.complete(job.id, job.lockToken);
 * } catch (err) {
 *   await queue.retry(job.id, job.lockToken, 30);
 * }
 * ```
 */
export class PostgresQueue {
    private readonly pool: Pool;

    /**
     * Creates a new queue instance.
     *
     * @param pool - Connected PostgreSQL pool instance.
     */
    constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Adds a new job to the queue.
     *
     * @template TPayload - JSON payload type.
     * @param queue - Queue name.
     * @param payload - Job payload.
     * @param scheduledAt - Time when the job becomes eligible for processing.
     * @returns Resolves once the job is inserted.
     *
     * @example
     * ```ts
     * await queue.enqueue("emails", {
     *   to: "user@example.com"
     * });
     * ```
     */
    async enqueue<TPayload>(queue: string, payload: TPayload, scheduledAt: Date = new Date()): Promise<void> {
        await this.pool.query(
            `INSERT INTO jobs (queue, payload, scheduled_at)
       VALUES ($1, $2, $3)`,
            [queue, payload, scheduledAt]
        );
    }

    /**
     * Leases the next available job from a queue.
     *
     * A lease prevents other workers from processing the same job
     * until the visibility timeout expires.
     *
     * @template TPayload - Expected payload type.
     * @param queue - Queue name.
     * @param visibilityTimeoutSeconds - Lease duration in seconds.
     * @returns A leased job or `undefined` if none are available.
     *
     * @example
     * ```ts
     * const job = await queue.dequeue<{ email: string }>("emails", 60);
     * if (!job) return;
     * ```
     */
    async dequeue<TPayload = unknown>(queue: string, visibilityTimeoutSeconds = 60): Promise<LeasedJob<TPayload> | undefined> {
        const lockToken = randomUUID();

        const result = await this.pool.query<Job<TPayload>>(
            `
      WITH next_job AS (
        SELECT id
        FROM jobs
        WHERE queue = $1
          AND attempts < max_attempts
          AND scheduled_at <= NOW()
          AND (
            locked_at IS NULL
            OR locked_at < NOW() - ($2 || ' seconds')::interval
          )
        ORDER BY scheduled_at
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE jobs
      SET attempts = attempts + 1,
          locked_at = NOW(),
          lock_token = $3
      FROM next_job
      WHERE jobs.id = next_job.id
      RETURNING jobs.*
      `,
            [queue, visibilityTimeoutSeconds, lockToken]
        );

        const job = result.rows[0];
        if (!job) {
            return undefined;
        }

        return { ...job, lockToken };
    }

    /**
     * Marks a leased job as successfully completed.
     *
     * The lock token ensures only the current worker
     * can complete the job.
     *
     * @param jobId - Job ID.
     * @param lockToken - Lease token received from dequeue.
     * @returns Resolves when the job is removed.
     */
    async complete(jobId: number, lockToken: string): Promise<void> {
        await this.pool.query(
            `
      DELETE FROM jobs
      WHERE id = $1
        AND lock_token = $2
      `,
            [jobId, lockToken]
        );
    }

    /**
     * Releases a leased job and schedules it for retry.
     *
     * @param jobId - Job ID.
     * @param lockToken - Lease token.
     * @param delaySeconds - Delay before the job becomes available again.
     * @returns Resolves when the job is rescheduled.
     *
     * @example
     * ```ts
     * await queue.retry(job.id, job.lockToken, 30);
     * ```
     */
    async retry(jobId: number, lockToken: string, delaySeconds = 30): Promise<void> {
        await this.pool.query(
            `
      UPDATE jobs
      SET locked_at = NULL,
          lock_token = NULL,
          scheduled_at = NOW() + ($3 || ' seconds')::interval
      WHERE id = $1
        AND lock_token = $2
      `,
            [jobId, lockToken, delaySeconds]
        );
    }

    /**
     * Permanently marks a job as failed.
     *
     * The error message is appended to the payload.
     *
     * @param jobId - Job ID.
     * @param lockToken - Lease token.
     * @param error - Error object or message.
     * @returns Resolves when the job is marked failed.
     */
    async fail(jobId: number, lockToken: string, error: unknown): Promise<void> {
        const message = error instanceof Error ? error.message : String(error);

        await this.pool.query(
            `
      UPDATE jobs
      SET attempts = max_attempts,
          locked_at = NULL,
          lock_token = NULL,
          payload = payload || jsonb_build_object('error', $3)
      WHERE id = $1
        AND lock_token = $2
      `,
            [jobId, lockToken, message]
        );
    }
}

export default PostgresQueue;
