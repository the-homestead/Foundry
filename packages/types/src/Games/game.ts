export interface Game {
    id: string; // Unique identifier for the game
    name: string; // Name of the game
    icon_url?: string; // Optional URL to the game's icon
    banner_url?: string; // Optional URL to the game's banner image
    website?: string; // Optional URL to the game's official website
    publisher?: string; // Optional name of the game's publisher
    description?: string; // Optional description of the game
    versions: GameVersion[]; // List of versions available for the game
    stats: GameStats; // Statistics related to the game, cached for quick access, updated every 24 hours
    genre: typeof GameGenre;
    app_supported: boolean;
    metadata: Record<string, string>;
}

export interface GameVersion {
    id: string; // Unique identifier for the game version
    name: string; // Name of the game version (e.g., "1.16.5", "2.0")
    release_date: string; // ISO 8601 date string representing the release date of the version
    change_log: string;
}

export interface GameStats {
    total_downloads: number; // Total number of downloads for all assets related to the game
    total_projects: number; // Total number of projects associated with the game
    total_packs: number; // Total number of mod packs available for the game
}

export const GameGenre = {
    Action: 0,
    Adventure: 1,
    ARPG: 2,
    DungeonCrawler: 3,
    Fighting: 4,
    FPS: 5,
    HackNSlash: 6,
    Horror: 7,
    Indie: 8,
    Metroidvania: 9,
    MMORPG: 10,
    Music: 11,
    Platformer: 12,
    Puzzle: 13,
    Racing: 14,
    Rougelike: 15,
    RPG: 16,
    RGS: 17,
    Sandbox: 18,
    Shooter: 19,
    Simulation: 20,
    SpaceSim: 21,
    Sports: 22,
    Stealth: 23,
    Strategy: 24,
    Survival: 25,
    Third_Person: 26,
    VisualNovel: 27,
};
