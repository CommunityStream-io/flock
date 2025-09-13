import Page from './page';
import StepLayoutPage from './step-layout.page';
import { browser, $ } from '@wdio/globals';
import { timeouts, timeoutMessages } from '../support/timeout-config';

class AuthPage extends Page {
    // Form elements
    public get authForm() {
        return $('.auth-form, .bluesky-auth, form');
    }

    public get usernameField() {
        return $('input[formControlName="username"], input[name="username"], .username-field input');
    }

    public get passwordField() {
        return $('input[formControlName="password"], input[name="password"], input[type="password"], .password-field input');
    }

    public get nextButton() {
        return StepLayoutPage.nextButton;
    }

    // Error elements
    public get usernameError() {
        return $('.username-error.mat-error');
    }

    public get passwordError() {
        return $('.password-error.mat-error');
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
        await this.authForm.waitForDisplayed({ timeout: timeouts.uiInteraction });
        await this.usernameField.waitForDisplayed({ timeout: timeouts.uiInteraction });
        await this.passwordField.waitForDisplayed({ timeout: timeouts.uiInteraction });
    }

    public async enterUsername(username: string) {
        await this.usernameField.clearValue();
        await this.usernameField.setValue(username);
        // Trigger blur to mark field as touched and trigger validation
        await this.usernameField.click();
        await browser.keys('Tab');
        // Wait for validation to complete
        await browser.waitUntil(
            async () => {
                const isFormValid = await this.isFormValid();
                return isFormValid;
            },
            { timeout: timeouts.uiInteraction, timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true') }
        );
    }

    public async enterPassword(password: string) {
        await this.passwordField.clearValue();
        await this.passwordField.setValue(password);
        // Trigger blur to mark field as touched and trigger validation
        await this.passwordField.click();
        await browser.keys('Tab');
        // Wait for validation to complete
        await browser.waitUntil(
            async () => {
                const isFormValid = await this.isFormValid();
                return isFormValid;
            },
            { timeout: timeouts.uiInteraction, timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true') }
        );
    }

    public async enterCredentials(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
    }

    public async clearUsernameField() {
        await this.usernameField.clearValue();
        // Trigger blur to mark field as touched and trigger validation
        await this.usernameField.click();
        await browser.keys('Tab');
        // Wait for validation to complete
        await browser.waitUntil(
            async () => {
                const isFormValid = await this.isFormValid();
                return isFormValid;
            },
            { timeout: timeouts.uiInteraction, timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true') }
        );
    }

    public async clearPasswordField() {
        await this.passwordField.clearValue();
        // Trigger blur to mark field as touched and trigger validation
        await this.passwordField.click();
        await browser.keys('Tab');
        // Wait for validation to complete
        await browser.waitUntil(
            async () => {
                const isFormValid = await this.isFormValid();
                return isFormValid;
            },
            { timeout: timeouts.uiInteraction, timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true') }
        );
    }

    public async submitForm() {
        await this.nextButton.click();
    }

    public async clickNext() {
        await StepLayoutPage.clickNextStep();
    }

    public async isFormValid() {
        // Check if the next button is enabled (which indicates form validity)
        const isButtonEnabled = await this.nextButton.isEnabled();
        return isButtonEnabled;
    }

    public async getUsernameErrorText() {
        if (await this.usernameError.isDisplayed()) {
            return await this.usernameError.getText();
        }
        return '';
    }

    public async getPasswordErrorText() {
        if (await this.passwordError.isDisplayed()) {
            return await this.passwordError.getText();
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
            { timeout: timeouts.auth, timeoutMsg: timeoutMessages.auth(process.env.CI === 'true') }
        );
    }

    public async waitForError() {
        await this.formError.waitForDisplayed({ timeout: timeouts.uiInteraction });
    }

    public async waitForSuccess() {
        await browser.waitUntil(
            async () => {
                const currentUrl = await browser.getUrl();
                return currentUrl.includes('/step/config');
            },
            { timeout: timeouts.navigation, timeoutMsg: timeoutMessages.navigation(process.env.CI === 'true') }
        );
    }

    // Help overlay methods
    public async clickHelpIcon() {
        const helpButton = await $('.help-button');
        await helpButton.click();
    }

    public async isHelpDialogVisible() {
        try {
            const dialog = await $('.help-dialog');
            return await dialog.isDisplayed();
        } catch (error) {
            return false;
        }
    }

    public async getHelpDialogText() {
        try {
            const dialog = await $('.help-dialog');
            return await dialog.getText();
        } catch (error) {
            return '';
        }
    }

    public async closeHelpDialog() {
        const closeButton = await $('.help-dialog .close-button');
        await closeButton.click();
    }

    public async closeHelpDialogWithEscape() {
        await browser.keys('Escape');
    }
}

export default new AuthPage();
