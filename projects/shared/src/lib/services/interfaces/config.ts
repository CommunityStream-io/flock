import { Credentials } from "./bluesky";


export interface Config {
    archivePath: string;
    blueskyCredentials: Credentials;
    simulate: boolean;
    validateConfig(): Promise<boolean>;
    resetConfig(): Promise<void>;
}