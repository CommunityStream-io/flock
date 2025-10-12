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
        
        console.log(`\n🧭 ==== NAVIGATION ATTEMPT START ====`);
        console.log(`🧭 Current URL: ${currentUrl}`);
        console.log(`🧭 Target step: ${targetStep}`);
        
        // Click the "Next" button to trigger Angular routing and guards
        // This simulates real user behavior
        try {
            // Find Next button by its class
            const nextButton = await $('.next-step');
            await nextButton.waitForDisplayed({ timeout: 5000 });
            console.log('✅ Next button found and visible');
            
            await nextButton.click();
            console.log('✅ Clicked Next button - canDeactivate guard should fire now');
            
            // Wait longer for Angular to:
            // 1. Process the canDeactivate guard
            // 2. Call MatSnackBar.open()
            // 3. Render the snackbar in the cdk-overlay-container
            console.log('⏳ Waiting 3 seconds for guard execution and snackbar rendering...');
            await browser.pause(3000);
            
        } catch (e) {
            console.log(`⚠️  Next button not found: ${e.message}`);
            console.log('⚠️  Trying routerLink approach (may bypass canDeactivate guard!)');
            // Fallback: Find and click any routerLink to the target step
            const link = await $(`a[href="/step/${targetStep}"], a[routerlink="/step/${targetStep}"]`);
            await link.waitForDisplayed({ timeout: 3000 });
            await link.click();
            await browser.pause(2000);
        }
        
        // Log the result
        const finalUrl = await browser.getUrl();
        console.log(`🧭 Final URL after guard execution: ${finalUrl}`);
        console.log(`🧭 Navigation ${currentUrl === finalUrl ? 'BLOCKED ✅' : 'ALLOWED ⚠️'}`);
        console.log(`🧭 ==== NAVIGATION ATTEMPT END ====\n`);
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
        // Wait for any navigation attempts to settle
        await browser.pause(500);
        
        const currentUrl = await browser.getUrl();
        const isOnStep = currentUrl.includes(`/step/${stepName}`);
        
        console.log(`🔍 URL check - Current URL: ${currentUrl}, On step '${stepName}': ${isOnStep}`);
        
        return isOnStep;
    }
    
    public async verifyOnStep(stepName: string) {
        await browser.pause(500);
        const currentUrl = await browser.getUrl();
        return currentUrl.includes(`/step/${stepName}`);
    }

    public async hasNavigatedToStep(stepName: string) {
        const currentUrl = await browser.getUrl();
        return currentUrl.includes(`/step/${stepName}`);
    }

    // Snackbar interaction methods
    public async waitForSnackbar(timeout: number = 8000) {
        console.log('🔍 ========== SNACKBAR DETECTION START ==========');
        
        // Note: attemptDirectNavigation already waits 3s, so snackbar should be ready
        // But we'll wait a bit more to be safe
        console.log('⏳ Waiting 500ms for snackbar animation...');
        await browser.pause(500);
        
        // First, inspect what's actually in the DOM
        try {
            const html = await browser.getPageSource();
            
            console.log('📄 DOM Inspection:');
            console.log(`   - Contains "snack-bar": ${html.includes('snack-bar')}`);
            console.log(`   - Contains "cdk-overlay": ${html.includes('cdk-overlay')}`);
            console.log(`   - Contains "mat-mdc": ${html.includes('mat-mdc')}`);
            
            if (html.includes('snack-bar')) {
                // Extract actual snackbar HTML
                const snackbarMatches = html.match(/<[^>]*snack[^>]*bar[^>]*>/gi);
                if (snackbarMatches) {
                    console.log('📋 Found snackbar-related tags:');
                    snackbarMatches.forEach((match, i) => {
                        console.log(`   ${i + 1}. ${match}`);
                    });
                }
            }
            
            if (html.includes('cdk-overlay-container')) {
                const overlaySnippet = html.match(/cdk-overlay-container[\s\S]{0,600}/i)?.[0];
                if (overlaySnippet) {
                    console.log('📦 Overlay container snippet:');
                    console.log(overlaySnippet.substring(0, 500));
                }
            }
        } catch (e) {
            console.log('⚠️  Could not inspect DOM:', e);
        }
        
        // Try multiple selectors for different Material versions and configurations
        const selectors = [
            'mat-snack-bar-container',
            '.mat-mdc-snack-bar-container',
            '.mat-snack-bar-container',
            '.cdk-overlay-container mat-snack-bar-container',
            '.cdk-overlay-container [role="status"]',
            '.cdk-overlay-container [role="alert"]',
            'simple-snack-bar'
        ];
        
        let found = false;
        let lastError: any = null;
        const perSelectorTimeout = Math.floor(timeout / selectors.length);
        
        console.log(`\n🎯 Testing ${selectors.length} selectors (${perSelectorTimeout}ms each):`);
        
        for (const selector of selectors) {
            try {
                console.log(`\n   🔎 Selector: "${selector}"`);
                const element = await $(selector);
                
                const exists = await element.isExisting();
                console.log(`      - Exists: ${exists}`);
                
                if (exists) {
                    const isDisplayed = await element.isDisplayed().catch(() => false);
                    console.log(`      - Displayed: ${isDisplayed}`);
                }
                
                await element.waitForDisplayed({ 
                    timeout: perSelectorTimeout,
                    interval: 500
                });
                found = true;
                console.log(`\n✅ ✅ ✅ SUCCESS! Snackbar found with: "${selector}" ✅ ✅ ✅`);
                break;
            } catch (e) {
                lastError = e;
                console.log(`      ❌ Failed: ${e.message}`);
            }
        }
        
        if (!found) {
            console.log('\n❌ ========== SNACKBAR NOT FOUND ==========');
            
            // Take screenshot for debugging
            const screenshotPath = './logs/analysis/snackbar-not-found-' + Date.now() + '.png';
            try {
                await browser.saveScreenshot(screenshotPath);
                console.log(`📸 Screenshot saved to: ${screenshotPath}`);
            } catch (screenshotError) {
                console.log('Could not save screenshot:', screenshotError);
            }
            
            throw new Error(
                `Snackbar not found with any selector after ${timeout}ms. ` +
                `Tried ${selectors.length} selectors. ` +
                `Last error: ${lastError?.message || 'unknown'}`
            );
        }
        
        console.log('========== SNACKBAR DETECTION END ==========\n');
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
        
        // Wait for upload page to load with longer timeout
        await browser.waitUntil(
            async () => {
                const uploadSection = $('.upload-section');
                return await uploadSection.isDisplayed();
            },
            { timeout: 8000, timeoutMsg: 'Upload page did not load within 8s' }
        );
        
        // Use the upload step page object to select a file
        const { pages } = await import('../pageobjects');
        await pages.uploadStep.selectFile('test-archive.zip');
        
        // Wait for file validation AND archivedFile to be set
        await browser.waitUntil(
            async () => {
                // Check UI validation state
                const hasFiles = await pages.uploadStep.hasFiles();
                const isFormValid = await pages.uploadStep.isFormValid();
                
                // Check if fileService.archivedFile is set (what the guard checks)
                const hasArchivedFile = await browser.execute(() => {
                    // Access Angular's DI to get the fileService
                    const app = (window as any).ng?.getInjector?.(document.querySelector('flock-mirage'));
                    if (app) {
                        try {
                            const FILE_PROCESSOR = Symbol.for('FILE_PROCESSOR');
                            const fileService = app.get(FILE_PROCESSOR);
                            return !!fileService?.archivedFile;
                        } catch (e) {
                            return false;
                        }
                    }
                    return false;
                });
                
                // Log validation state for debugging
                if (!hasFiles || !isFormValid || !hasArchivedFile) {
                    console.log(`⏳ File validation in progress - hasFiles: ${hasFiles}, isFormValid: ${isFormValid}, hasArchivedFile: ${hasArchivedFile}`);
                }
                
                return hasFiles && isFormValid && hasArchivedFile;
            },
            { 
                timeout: 15000,
                interval: 1000,
                timeoutMsg: 'File validation did not complete within 15s - either UI validation or archivedFile not set' 
            }
        );
        
        // Small pause to ensure state propagation
        await browser.pause(500);
        console.log('✅ File upload simulation complete - archivedFile is set');
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
            { timeout: 8000, timeoutMsg: 'Upload page did not load within 8s' }
        );
        
        // Try to select an invalid file (this should be prevented by the accept attribute)
        const fileInput = await $('input[type="file"]');
        const acceptAttribute = await fileInput.getAttribute('accept');
        
        // Verify that only zip files are accepted
        if (acceptAttribute !== '.zip') {
            throw new Error('File input should only accept zip files');
        }
        
        // Wait for validation errors to appear
        await browser.waitUntil(
            async () => {
                const hasErrors = await this.hasValidationErrors();
                console.log(`⏳ Waiting for validation errors - hasErrors: ${hasErrors}`);
                return hasErrors;
            },
            {
                timeout: 8000,  // Increased timeout
                interval: 500,
                timeoutMsg: 'File validation errors did not appear within 8s'
            }
        );
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