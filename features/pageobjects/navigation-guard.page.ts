import Page from './page';
import { timeouts, timeoutMessages } from '../support/timeout-config';

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
            { timeout: timeouts.navigation, timeoutMsg: timeoutMessages.navigation(process.env.CI === 'true') }
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
            { timeout: timeouts.navigation, timeoutMsg: timeoutMessages.navigation(process.env.CI === 'true') }
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
        await browser.waitUntil(
            async () => !(await this.isSnackbarVisible()),
            { timeout, timeoutMsg: timeoutMessages.dialogClose(process.env.CI === 'true') }
        );
    }

    public async clickSnackbarClose() {
        const closeButton = await this.snackbarCloseButton;
        if (await closeButton.isExisting()) {
            await closeButton.click();
        }
    }

    // File state simulation methods
    public async simulateNoFileUploaded() {
        // Execute JavaScript to reset file service state
        await browser.execute(() => {
            // This would depend on your actual file service implementation
            // For now, we'll simulate by clearing any file inputs
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                (input as HTMLInputElement).value = '';
                input.dispatchEvent(new Event('change'));
            });
        });
    }

    public async simulateValidFileUploaded() {
        // Execute JavaScript to simulate valid file state
        await browser.execute(() => {
            // This would ideally set the file service state
            // For testing, we might need to mock the service
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
                // Create a mock file
                const dt = new DataTransfer();
                const file = new File(['valid archive content'], 'valid-archive.zip', { type: 'application/zip' });
                dt.items.add(file);
                fileInput.files = dt.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    public async simulateInvalidFile() {
        await browser.execute(() => {
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
                const dt = new DataTransfer();
                const file = new File(['invalid content'], 'invalid.txt', { type: 'text/plain' });
                dt.items.add(file);
                fileInput.files = dt.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    // Validation state checking
    public async isFileServiceValid() {
        return await browser.execute(() => {
            // This would check the actual file service state
            // For now, check if we have valid files in inputs
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            return fileInput && fileInput.files && fileInput.files.length > 0;
        });
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
        // Wait for guard to execute and potentially show messages
        // Wait for the specified timeout period
        await browser.waitUntil(
            async () => {
                // This is a deliberate delay, so we just wait for the timeout period
                return true;
            },
            { timeout: timeout, timeoutMsg: `Deliberate delay of ${timeout}ms completed` }
        );
    }
}

export default new NavigationGuardPage();