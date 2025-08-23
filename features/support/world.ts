import { setWorldConstructor, World, IWorldOptions } from '@wdio/cucumber-framework';
import { TestFileHelper, NavigationTestHelper, ValidationTestHelper, DebugHelper } from './test-helpers';

export interface ICustomWorld extends World {
    // Test state
    selectedFiles: File[];
    validationState: { isValid: boolean; errors: string[]; success: boolean };
    navigationAttempts: { targetStep: string; success: boolean; timestamp: Date }[];
    lastSnackbarMessage: string | null;
    
    // Helper methods
    fileHelper: typeof TestFileHelper;
    navigationHelper: typeof NavigationTestHelper;
    validationHelper: typeof ValidationTestHelper;
    debugHelper: typeof DebugHelper;
    
    // State management
    resetState(): void;
    captureCurrentState(): Promise<void>;
}

export class CustomWorld extends World implements ICustomWorld {
    public selectedFiles: File[] = [];
    public validationState = { isValid: false, errors: [], success: false };
    public navigationAttempts: { targetStep: string; success: boolean; timestamp: Date }[] = [];
    public lastSnackbarMessage: string | null = null;
    
    // Helper instances
    public fileHelper = TestFileHelper;
    public navigationHelper = NavigationTestHelper;
    public validationHelper = ValidationTestHelper;
    public debugHelper = DebugHelper;

    constructor(options: IWorldOptions) {
        super(options);
    }

    public resetState(): void {
        this.selectedFiles = [];
        this.validationState = { isValid: false, errors: [], success: false };
        this.navigationAttempts = [];
        this.lastSnackbarMessage = null;
    }

    public async captureCurrentState(): Promise<void> {
        // Capture validation state
        this.validationState = await this.fileHelper.getValidationState();
        
        // Capture any snackbar messages
        this.lastSnackbarMessage = await this.navigationHelper.captureSnackbarMessage(1000);
        
        // Log for debugging if needed
        if (process.env.DEBUG_TESTS === 'true') {
            await this.debugHelper.logPageState();
        }
    }

    // Convenience methods for common test operations
    public async selectValidArchive(filename: string = 'test-archive.zip'): Promise<void> {
        const file = this.fileHelper.createValidArchiveFile(filename);
        this.selectedFiles.push(file);
        
        // Simulate the file selection in the browser
        const fileInput = await $('input[type="file"]');
        await this.fileHelper.simulateFileSelection(fileInput, file);
        await this.fileHelper.waitForValidation();
        
        await this.captureCurrentState();
    }

    public async selectInvalidFile(filename: string = 'invalid.txt'): Promise<void> {
        const file = this.fileHelper.createInvalidFile(filename);
        this.selectedFiles.push(file);
        
        const fileInput = await $('input[type="file"]');
        await this.fileHelper.simulateFileSelection(fileInput, file);
        await this.fileHelper.waitForValidation();
        
        await this.captureCurrentState();
    }

    public async attemptNavigationToStep(stepName: string): Promise<boolean> {
        const result = await this.navigationHelper.attemptNavigation(`/step/${stepName}`);
        
        this.navigationAttempts.push({
            targetStep: stepName,
            success: result.success,
            timestamp: new Date()
        });
        
        await this.captureCurrentState();
        return result.success;
    }

    public async clearAllFiles(): Promise<void> {
        await this.fileHelper.clearAllFileSelections();
        this.selectedFiles = [];
        await this.captureCurrentState();
    }

    public getLastNavigationAttempt(): { targetStep: string; success: boolean; timestamp: Date } | null {
        return this.navigationAttempts.length > 0 
            ? this.navigationAttempts[this.navigationAttempts.length - 1] 
            : null;
    }

    public hasNavigationFailed(stepName: string): boolean {
        const lastAttempt = this.getLastNavigationAttempt();
        return lastAttempt?.targetStep === stepName && !lastAttempt.success;
    }

    public hasValidationErrors(): boolean {
        return this.validationState.errors.length > 0;
    }

    public getValidationErrors(): string[] {
        return this.validationState.errors;
    }

    public async waitForElement(selector: string, timeout: number = 5000): Promise<WebdriverIO.Element> {
        const element = await $(selector);
        await element.waitForDisplayed({ timeout });
        return element;
    }

    public async waitForAngularStability(): Promise<void> {
        // Wait for Angular to be stable
        await browser.waitUntil(
            async () => {
                const isStable = await browser.execute(() => {
                    return new Promise((resolve) => {
                        if (typeof (window as any).ng === 'undefined') {
                            resolve(true); // No Angular, assume stable
                            return;
                        }
                        
                        // Check Angular stability
                        const zone = (window as any).Zone?.current;
                        if (zone && zone.isStable) {
                            resolve(zone.isStable);
                        } else {
                            // Fallback: wait a bit and assume stable
                            setTimeout(() => resolve(true), 100);
                        }
                    });
                });
                return isStable;
            },
            { timeout: 10000, timeoutMsg: 'Angular did not become stable' }
        );
    }
}

setWorldConstructor(CustomWorld);