import { Credentials } from "./bluesky";


export interface ConfigService {
    archivePath: string;
    blueskyCredentials: Credentials | null;
    simulate: boolean;
    testVideoMode: boolean;
    startDate: string;
    endDate: string;
    validateConfig(): Promise<boolean>;
    resetConfig(): Promise<void>;
}