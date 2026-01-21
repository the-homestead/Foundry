export interface ModLoader {
    id: string;
    name: string;
    icon_url?: string;
    authors?: string[];
    download_url?: string;
    discord?: string;
    website?: string;
    docs?: string;
}

export interface MinecraftVersion {
    id: string;
    name: string;
    release_date: string; // ISO 8601 date string
    type: "release" | "snapshot" | "old_beta" | "old_alpha";
    mod_loaders: ModLoader[];
}
