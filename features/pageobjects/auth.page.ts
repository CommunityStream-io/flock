import Page from './page';

class AuthPage extends Page {
    // Form elements
    public get authForm() {
        return $('.auth-form, form');
    }

    public get usernameField() {
        return $('input[formControlName="username"], input[name="username"]');
    }

    public get passwordField() {
        return $('input[formControlName="password"], input[name="password"], input[type="password"]');
    }

    public get nextButton() {
        return $('button[type="submit"], .next-step, button:contains("Next")');
    }

    public get submitButton() {
        return $('button[type="submit"], .submit-button');
    }

    // Error elements
    public get usernameError() {
        return $('.username-error, .mat-error, [data-error="username"]');
    }

    public get passwordError() {
        return $('.password-error, .mat-error, [data-error="password"]');
    }

    public get formError() {
        return $('.form-error, .auth-error, .error-message');
    }

    // Success elements
    public get successMessage() {
        return $('.success-message, .auth-success');
    }

    // Loading elements
    public get loadingSpinner() {
        return $('.loading-spinner, .spinner, mat-spinner');
    }

    // Step information
    public get stepTitle() {
        return $('h1, h2, .step-title');
    }

    public get stepDescription() {
        return $('.step-description, .auth-description');
    }

    // Methods
    public async open() {
        await super.open('step/auth');
        await this.waitForPageLoad();
    }

    public async waitForPageLoad() {
        await this.authForm.waitForDisplayed({ timeout: 10000 });
        await this.usernameField.waitForDisplayed({ timeout: 5000 });
        await this.passwordField.waitForDisplayed({ timeout: 5000 });
    }

    public async enterUsername(username: string) {
        await this.usernameField.clearValue();
        await this.usernameField.setValue(username);
        // Trigger blur to mark field as touched and trigger validation
        await this.usernameField.click();
        await browser.keys('Tab');
    }

    public async enterPassword(password: string) {
        await this.passwordField.clearValue();
        await this.passwordField.setValue(password);
        // Trigger blur to mark field as touched and trigger validation
        await this.passwordField.click();
        await browser.keys('Tab');
    }

    public async enterCredentials(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
    }

    public async submitForm() {
        await this.submitButton.click();
    }

    public async clickNext() {
        await this.nextButton.click();
    }

    public async isFormValid() {
        const usernameErrorDisplayed = await this.usernameError.isDisplayed().catch(() => false);
        const passwordErrorDisplayed = await this.passwordError.isDisplayed().catch(() => false);
        return !usernameErrorDisplayed && !passwordErrorDisplayed;
    }

    public async getUsernameErrorText() {
        if (await this.usernameError.isDisplayed()) {
            return await this.usernameError.getText();
        }
        return '';
    }

    public async getPasswordErrorText() {
        if (await this.passwordError.isDisplayed()) {
            return await this.passwordField.getText();
        }
        return '';
    }

    public async isNextButtonEnabled() {
        return await this.nextButton.isEnabled();
    }

    public async waitForAuthentication() {
        // Wait for either navigation (success) or error message (failure)
        await browser.waitUntil(
            async () => {
                const currentUrl = await browser.getUrl();
                const hasError = await this.formError.isDisplayed().catch(() => false);
                return currentUrl.includes('/step/config') || hasError;
            },
            { timeout: 15000, timeoutMsg: 'Authentication did not complete' }
        );
    }

    public async waitForError() {
        await this.formError.waitForDisplayed({ timeout: 5000 });
    }

    public async waitForSuccess() {
        await browser.waitUntil(
            async () => {
                const currentUrl = await browser.getUrl();
                return currentUrl.includes('/step/config');
            },
            { timeout: 10000, timeoutMsg: 'Navigation to config step did not occur' }
        );
    }

    // Help overlay methods
    public async clickHelpIcon() {
        const helpButton = await $('.help-button');
        await helpButton.click();
    }

    public async isHelpDialogVisible() {
        try {
            // Wait a bit for dialog to appear
            await browser.pause(1000);
            
            // Try multiple selectors to find the dialog
            const selectors = [
                '.help-dialog',
                '.mat-mdc-dialog-container .help-dialog',
                '.cdk-overlay-container .help-dialog',
                '[role="dialog"]'
            ];
            
            for (const selector of selectors) {
                try {
                    const dialog = await $(selector);
                    if (await dialog.isDisplayed()) {
                        console.log(`✅ Found dialog with selector: ${selector}`);
                        return true;
                    }
                } catch (e) {
                    console.log(`❌ Selector failed: ${selector}`);
                }
            }
            
            console.log('❌ No dialog found with any selector');
            return false;
        } catch (error) {
            console.log('❌ Error checking dialog visibility:', error);
            return false;
        }
    }

    public async getHelpDialogText() {
        try {
            // Wait a bit for dialog to appear
            await browser.pause(500);
            
            const dialog = await $('.help-dialog');
            return await dialog.getText();
        } catch (error) {
            return '';
        }
    }

    public async closeHelpDialog() {
        try {
            // Try to find and click the close button
            const closeButton = await $('.close-button');
            if (await closeButton.isDisplayed()) {
                await closeButton.click();
            } else {
                // Fallback: press Escape key
                await browser.keys('Escape');
            }
        } catch (error) {
            // Fallback: press Escape key
            await browser.keys('Escape');
        }
    }
}

export default new AuthPage();
