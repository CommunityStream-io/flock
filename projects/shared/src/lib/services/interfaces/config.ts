import { Credentials } from "./bluesky";


export interface ConfigService {
    archivePath: string;
    blueskyCredentials: Credentials;
    simulate: boolean;
    validateConfig(): Promise<boolean>;
    resetConfig(): Promise<void>;
}