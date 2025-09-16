import Page from './page';
import { timeouts, timeoutMessages, timeoutOptions } from '../support/timeout-config';

class NavigationGuardPage extends Page {
    // Snackbar elements
    public get snackbar() {
        return $('mat-snack-bar-container, .mat-mdc-snack-bar-container');
    }

    public get snackbarMessage() {
        return $('.mat-mdc-snack-bar-label, .mat-snack-bar-container simple-snack-bar');
    }

    public get snackbarCloseButton() {
        return $('.mat-mdc-snack-bar-action button, .mat-snack-bar-action button');
    }

    // Error and validation elements
    public get errorMessages() {
        return $$('.error-message, .mat-error, .validation-error');
    }

    public get validationMessages() {
        return $$('.validation-message, .mat-hint, .field-hint');
    }

    public get successMessages() {
        return $$('.success-message, .validation-success');
    }

    // Navigation attempt elements
    public get browserBackButton() {
        // We'll use browser.back() instead of clicking a button
        return null;
    }

    // File service state indicators (for debugging/testing)
    public get fileServiceStatus() {
        return $('.file-service-status, .upload-status');
    }

    // Methods for guard testing
    public async attemptDirectNavigation(targetStep: string) {
        const currentUrl = await browser.getUrl();
        await browser.url(currentUrl.replace(/\/step\/\w+/, `/step/${targetStep}`));
        
        // Wait a moment for any navigation guards to execute
        // Wait for navigation to complete
        await browser.waitUntil(
            async () => {
                const currentUrl = await browser.getUrl();
                return currentUrl.includes('auth');
            },
            timeoutOptions.navigation
        );
    }

    public async attemptNavigationViaHistory(targetStep: string) {
        // Try to navigate using browser history manipulation
        await browser.execute((step) => {
            window.history.pushState({}, '', `/step/${step}`);
            // Trigger Angular router to process the URL change
            window.dispatchEvent(new Event('popstate'));
        }, targetStep);
        
        // Wait for navigation to complete
        await browser.waitUntil(
            async () => {
                const currentUrl = await browser.getUrl();
                return currentUrl.includes('auth');
            },
            timeoutOptions.navigation
        );
    }

    public async getCurrentUrl() {
        return await browser.getUrl();
    }

    public async isStillOnStep(stepName: string) {
        const currentUrl = await browser.getUrl();
        return currentUrl.includes(`/step/${stepName}`);
    }

    public async hasNavigatedToStep(stepName: string) {
        const currentUrl = await browser.getUrl();
        return currentUrl.includes(`/step/${stepName}`);
    }

    // Snackbar interaction methods
    public async waitForSnackbar(timeout: number = 5000) {
        await this.snackbar.waitForDisplayed({ timeout });
    }

    public async getSnackbarText() {
        await this.waitForSnackbar();
        const messageElement = await this.snackbarMessage;
        return await messageElement.getText();
    }

    public async isSnackbarVisible() {
        return await this.snackbar.isDisplayed();
    }

    public async waitForSnackbarToDismiss(timeout: number = timeouts.dialogClose) {
        // Use waitForDisplayed with reverse for snackbar dismissal
        await this.snackbar.waitForDisplayed({ 
            reverse: true, 
            timeout, 
            timeoutMsg: timeoutOptions.dialogClose.timeoutMsg 
        });
    }

    public async clickSnackbarClose() {
        const closeButton = await this.snackbarCloseButton;
        if (await closeButton.isExisting()) {
            await closeButton.click();
        }
    }

    // File state simulation methods - now use page object methods
    public async simulateNoFileUploaded() {
        // Navigate to upload step and ensure no files are selected
        await browser.url('/step/upload');
        
        // Wait for upload page to load
        await browser.waitUntil(
            async () => {
                const uploadSection = $('.upload-section');
                return await uploadSection.isDisplayed();
            },
            { timeout: 5000, timeoutMsg: 'Upload page did not load' }
        );
        
        // Clear any existing files by clicking delete buttons
        const deleteButtons = await $$('.file-selected button[mat-icon-button]');
        for (const button of deleteButtons) {
            if (await button.isDisplayed()) {
                await button.click();
            }
        }
    }

    public async simulateValidFileUploaded() {
        // Navigate to upload step
        await browser.url('/step/upload');
        
        // Wait for upload page to load
        await browser.waitUntil(
            async () => {
                const uploadSection = $('.upload-section');
                return await uploadSection.isDisplayed();
            },
            { timeout: 5000, timeoutMsg: 'Upload page did not load' }
        );
        
        // Use the upload step page object to select a file
        const { pages } = await import('../pageobjects');
        await pages.uploadStep.selectFile('test-archive.zip');
        
        // Wait for file validation to complete
        await browser.waitUntil(
            async () => {
                const hasFiles = await pages.uploadStep.hasFiles();
                const isFormValid = await pages.uploadStep.isFormValid();
                return hasFiles && isFormValid;
            },
            { timeout: 5000, timeoutMsg: 'File validation did not complete' }
        );
    }

    public async simulateInvalidFile() {
        // Navigate to upload step
        await browser.url('/step/upload');
        
        // Wait for upload page to load
        await browser.waitUntil(
            async () => {
                const uploadSection = $('.upload-section');
                return await uploadSection.isDisplayed();
            },
            { timeout: 5000, timeoutMsg: 'Upload page did not load' }
        );
        
        // Try to select an invalid file (this should be prevented by the accept attribute)
        const fileInput = await $('input[type="file"]');
        const acceptAttribute = await fileInput.getAttribute('accept');
        
        // Verify that only zip files are accepted
        if (acceptAttribute !== '.zip') {
            throw new Error('File input should only accept zip files');
        }
    }

    // Validation state checking - now use page object methods
    public async isFileServiceValid() {
        try {
            // Use the upload step page object to check file state
            const { pages } = await import('../pageobjects');
            const hasFiles = await pages.uploadStep.hasFiles();
            const isFormValid = await pages.uploadStep.isFormValid();
            return hasFiles && isFormValid;
        } catch (error) {
            return false;
        }
    }

    public async hasValidationErrors() {
        const errors = await this.errorMessages;
        return await errors.length > 0;
    }

    public async hasValidationSuccess() {
        const successes = await this.successMessages;
        return await successes.length > 0;
    }

    // Wait for guard execution
    public async waitForGuardExecution(timeout: number = 3000) {
        // Simple delay for guard execution - no need for waitUntil
        await browser.pause(timeout);
    }
}

export default new NavigationGuardPage();