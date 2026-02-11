import { Buffer } from "node:buffer";
import type { Readable } from "node:stream";
// biome-ignore lint/performance/noNamespaceImport: <Storage API>
import * as BunnyStorageSDK from "@bunny.net/storage-sdk";

// ----------------------------------------------------------------------------
// Configuration & Constants
// ----------------------------------------------------------------------------

// TODO: Move these sensitive keys to environment variables
const STORAGE_ZONE_NAME = "myhm-homestead";
const ACCESS_KEY = "026af043-bcaa-49ae-93f16333be6a-566c-44e0";
const REGION = BunnyStorageSDK.regions.StorageRegion.NewYork;
const PUBLIC_DATA_URL = "https://data.homestead.systems/";

const storageZone = BunnyStorageSDK.zone.connect_with_accesskey(REGION, STORAGE_ZONE_NAME, ACCESS_KEY);

export const STORAGE_ROOT = "foundry";

export const StoragePaths = {
    User: {
        avatar: (userId: string) => `${STORAGE_ROOT}/users/${userId}/avatar`,
    },
    Project: {
        root: (projectId: string) => `${STORAGE_ROOT}/projects/${projectId}`,
        files: (projectId: string) => `${STORAGE_ROOT}/projects/${projectId}/files`,
        images: (projectId: string) => `${STORAGE_ROOT}/projects/${projectId}/images`,
        optional: (projectId: string) => `${STORAGE_ROOT}/projects/${projectId}/optional`,
    },
    Game: {
        root: (gameId: string) => `${STORAGE_ROOT}/games/${gameId}`,
        images: (gameId: string) => `${STORAGE_ROOT}/games/${gameId}/images`,
        data: (gameId: string) => `${STORAGE_ROOT}/games/${gameId}/data`,
    },
} as const;

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface FileMetadata {
    Guid: string;
    ObjectName: string;
    Path: string;
    Length: number;
    ContentType?: string;
    DateCreated?: string;
    LastChanged?: string;
    IsDirectory?: boolean;
    Checksum?: string;
    ReplicatedZones?: string[];
    UserId?: string;
    StorageZoneName?: string;
    StorageZoneId?: number;
    ServerId?: number;
    // keep other properties permissive
    [key: string]: unknown;
}

export interface UploadOptions {
    /**
     * The SHA256 Checksum associated with the data being sent.
     * If not provided, the server will automatically calculate it.
     */
    sha256Checksum?: string;
    /**
     * Override the content-type of the uploaded file.
     */
    contentType?: string;
}

export interface DownloadResult {
    blob: Blob;
    length?: number;
    contentType?: string;
    response?: unknown;
    metadata?: FileMetadata;
}

// ----------------------------------------------------------------------------
// Core Storage Operations
// ----------------------------------------------------------------------------

/**
 * Returns the configured Bunny Storage Zone instance.
 */
export function getStorageZone() {
    return storageZone;
}

/**
 * Generates a public URL for a file in the data storage.
 * @param path Relative path to the file.
 */
export function getPublicURL(path: string): string {
    // Ensure path doesn't start with a slash to avoid double slashes
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    // Check if the path is already absolute or contains the base URL
    if (cleanPath.startsWith("http")) {
        return cleanPath;
    }

    // Check if path already contains the foundry folder prefix and strip it if it does
    // to avoid duplication since getPublicURL appends it
    if (cleanPath.startsWith(`${STORAGE_ROOT}/`)) {
        return `${PUBLIC_DATA_URL}${cleanPath}`;
    }

    return `${PUBLIC_DATA_URL}${STORAGE_ROOT}/${cleanPath}`;
}

/**
 * Lists files and directories at the specified path.
 * @param path The directory path to list.
 */
export async function listFiles(path: string): Promise<FileMetadata[]> {
    const files = await BunnyStorageSDK.file.list(storageZone, path);
    return files as unknown as FileMetadata[];
}

/**
 * Uploads a file to the storage zone.
 * @param path The destination path including filename.
 * @param file The file content to upload.
 * @param options Upload options (checksum, content-type).
 */
export async function uploadFile(path: string, file: Blob | File | ArrayBuffer | Uint8Array, options?: UploadOptions): Promise<unknown> {
    const { sha256Checksum, contentType } = options ?? {};
    try {
        const result = await BunnyStorageSDK.file.upload(storageZone, path, file, {
            sha256Checksum,
            contentType,
        });
        return result;
    } catch (error) {
        throw error instanceof Error ? error : new Error(String(error));
    }
}

/**
 * Deletes a file at the specified path.
 * @param path The path of the file to delete.
 */
export async function deleteFile(path: string): Promise<unknown> {
    const result = await BunnyStorageSDK.file.remove(storageZone, path);
    return result;
}

/**
 * Deletes a directory and its contents recursively.
 * @param path The path of the directory to delete.
 */
export async function deleteDirectory(path: string): Promise<unknown> {
    const result = await BunnyStorageSDK.file.removeDirectory(storageZone, path);
    return result;
}

/**
 * Gets metadata for a file without downloading the content.
 * @param path The path to the file.
 */
export async function getFileMetadata(path: string): Promise<FileMetadata> {
    const metadata = await BunnyStorageSDK.file.get(storageZone, path);
    return metadata as FileMetadata;
}

/**
 * Downloads a file directly.
 * Returns a Blob suitable for browser usage along with metadata if available.
 * @param path The path to the file to download.
 */
export async function downloadFile(path: string): Promise<DownloadResult> {
    const { stream, response, length } = await BunnyStorageSDK.file.download(storageZone, path);
    try {
        const arrayBuffer = await streamAndResponseToArrayBuffer(stream, response);

        let contentType: string | undefined | null;

        if (response && typeof response === "object" && "headers" in response && typeof (response as { headers: { get: unknown } }).headers.get === "function") {
            contentType = (response as { headers: { get: (k: string) => string | null } }).headers.get("content-type");
        }

        if (!contentType && response && typeof response === "object" && "contentType" in response) {
            contentType = (response as { contentType: string }).contentType;
        }

        const blob = new Blob([arrayBuffer], { type: contentType ?? undefined });
        return {
            blob,
            length: typeof length === "number" ? length : undefined,
            contentType: contentType ?? undefined,
            response,
        };
    } catch (err) {
        throw err instanceof Error ? err : new Error(String(err));
    }
}

/**
 * Downloads a file by first fetching its metadata, then using the metadata's data() method.
 * Useful if you need metadata alongside the file content.
 * @param path The path to the file to download.
 */
export async function downloadFileFromMetadata(path: string): Promise<DownloadResult> {
    const fileMetadata = await getFileMetadata(path);

    // fileMetadata.data is a function on the SDK's metadata object
    // call it to retrieve stream/response/length
    if (!("data" in fileMetadata) || typeof (fileMetadata as { [key: string]: unknown }).data !== "function") {
        throw new Error("metadata.data() is not available for this file");
    }

    const dataFn = (
        fileMetadata as unknown as {
            data: () => Promise<{ stream: unknown; response: unknown; length: number }>;
        }
    ).data;

    const { stream, response, length } = await dataFn.call(fileMetadata);
    try {
        const arrayBuffer = await streamAndResponseToArrayBuffer(stream, response);

        let contentType: string | undefined | null = fileMetadata.ContentType;

        if (!contentType && response && typeof response === "object" && "headers" in response && typeof (response as { headers: { get: unknown } }).headers.get === "function") {
            contentType = (response as { headers: { get: (k: string) => string | null } }).headers.get("content-type");
        }

        const blob = new Blob([arrayBuffer], { type: contentType ?? undefined });
        return {
            blob,
            length: typeof length === "number" ? length : undefined,
            contentType: contentType ?? undefined,
            response,
            metadata: fileMetadata,
        };
    } catch (err) {
        throw err instanceof Error ? err : new Error(String(err));
    }
}

// ----------------------------------------------------------------------------
// Feature-Specific Helpers
// ----------------------------------------------------------------------------

export const UserStorage = {
    /**
     * Lists all avatars for a specific user.
     * @param userId The user's ID.
     */
    listAvatars: async (userId: string): Promise<FileMetadata[]> => {
        const path = StoragePaths.User.avatar(userId);
        try {
            return await listFiles(path);
        } catch {
            // If directory doesn't exist, return empty
            return [];
        }
    },

    /**
     * Uploads a new user avatar and maintains only the 5 most recent ones.
     * @param userId The user's ID.
     * @param file The file content.
     * @param originalFilename The original filename of the avatar.
     * @param options Upload options.
     */
    uploadAvatar: async (userId: string, file: Blob | File | ArrayBuffer | Uint8Array, originalFilename: string, options?: UploadOptions): Promise<string> => {
        const timestamp = Date.now();
        // Sanitize filename to prevent directory traversal or weird chars
        const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}_${cleanFilename}`;
        const path = `${StoragePaths.User.avatar(userId)}/${filename}`;

        await uploadFile(path, file, options);

        // Cleanup old avatars, keeping 5 (including the new one)
        await UserStorage.cleanupAvatars(userId);

        return filename;
    },

    /**
     * Internal helper to cleanup old avatars.
     * Keeps the 5 most recent avatars for a user.
     */
    cleanupAvatars: async (userId: string) => {
        const avatars = await UserStorage.listAvatars(userId);
        if (avatars.length <= 5) {
            return;
        }

        // Sort by name descending (assuming [timestamp]_[name] format)
        // Newest timestamp (largest number) comes first
        const sorted = avatars.sort((a, b) => {
            if (a.ObjectName < b.ObjectName) {
                return 1;
            }
            if (a.ObjectName > b.ObjectName) {
                return -1;
            }
            return 0;
        });

        // Keep top 5, delete the rest
        const toDelete = sorted.slice(5);

        // Process deletes
        await Promise.all(
            toDelete.map((file) => {
                const path = `${StoragePaths.User.avatar(userId)}/${file.ObjectName}`;
                return deleteFile(path);
            })
        );
    },
};

export const ProjectStorage = {
    /**
     * Lists files for a project in a specific category.
     * @param projectId The project ID.
     * @param type The category of files to list ('files', 'images', 'optional').
     */
    listFiles: async (projectId: string, type: "files" | "images" | "optional"): Promise<FileMetadata[]> => {
        return await listFiles(StoragePaths.Project[type](projectId));
    },
};

export const GameStorage = {
    /**
     * Lists files for a game in a specific category.
     * @param gameId The game ID.
     * @param type The category of files to list ('images', 'data').
     */
    listFiles: async (gameId: string, type: "images" | "data"): Promise<FileMetadata[]> => {
        return await listFiles(StoragePaths.Game[type](gameId));
    },

    /**
     * Uploads a file for a game.
     * @param gameId The game ID.
     * @param type The category for the file.
     * @param file The file content.
     * @param filename The filename.
     * @param options Upload options.
     */
    uploadFile: async (gameId: string, type: "images" | "data", file: Blob | File | ArrayBuffer | Uint8Array, filename: string, options?: UploadOptions): Promise<void> => {
        const path = `${StoragePaths.Game[type](gameId)}/${filename}`;
        await uploadFile(path, file, options);
    },
};

// ----------------------------------------------------------------------------
// Internal Utilities
// ----------------------------------------------------------------------------

/**
 * Converts a Node.js Readable stream to an ArrayBuffer.
 */
async function nodeStreamToArrayBuffer(stream: Readable): Promise<ArrayBuffer> {
    return await new Promise<ArrayBuffer>((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on("data", (chunk: Buffer | Uint8Array | string) => {
            if (typeof chunk === "string") {
                chunks.push(Buffer.from(chunk));
            } else if (Buffer.isBuffer(chunk)) {
                chunks.push(chunk);
            } else {
                chunks.push(new Uint8Array(chunk));
            }
        });
        stream.on("end", () => {
            const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
            resolve(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
        });
        stream.on("error", (err: unknown) => reject(err));
    });
}

/**
 * Standardizes stream/response conversion to ArrayBuffer across environments (Node/Web).
 */
async function streamAndResponseToArrayBuffer(stream: unknown, response: unknown): Promise<ArrayBuffer> {
    // Prefer response.arrayBuffer() if present (fetch Response)
    if (response && typeof response === "object" && "arrayBuffer" in response && typeof (response as { arrayBuffer: unknown }).arrayBuffer === "function") {
        return await (response as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();
    }

    // Web ReadableStream handling
    const GlobalReadableStream = typeof ReadableStream !== "undefined" ? ReadableStream : (globalThis as unknown as { ReadableStream?: typeof ReadableStream }).ReadableStream;

    if (GlobalReadableStream && stream instanceof GlobalReadableStream) {
        return await new Response(stream as ReadableStream).arrayBuffer();
    }

    // Node.js Readable stream
    if (stream && typeof stream === "object" && "on" in stream && typeof (stream as { on: unknown }).on === "function") {
        return await nodeStreamToArrayBuffer(stream as Readable);
    }

    throw new Error("Unsupported stream/response type for converting to ArrayBuffer");
}
