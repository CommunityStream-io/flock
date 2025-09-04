import Page from './page';

class StepLayoutPage extends Page {
    // Step layout container
    public get stepLayoutContainer() {
        return $('.app-layout');
    }

    public get appContent() {
        return $('.app-content');
    }

    public get routerOutlet() {
        return $('router-outlet');
    }

    // Step navigation footer
    public get stepNavigationFooter() {
        return $('footer');
    }

    public get stepNavigationComponent() {
        return $('shared-step-navigation');
    }

    // Step navigation buttons and indicators
    public get nextButton() {
        return $('shared-step-navigation button.next-step, .next-step');
    }

    public get previousButton() {
        return $('shared-step-navigation button.previous-step');
    }

    public get stepIndicators() {
        return $$('.step-indicator');
    }

    public get currentStepIndicator() {
        return $('.step-indicator.active, .step-indicator.current');
    }

    // Step-specific elements
    public get stepTitle() {
        return $('h1, h2, .step-title, mat-card-title');
    }

    public get stepDescription() {
        return $('.step-description, mat-card-subtitle, .upload-section p');
    }

    // Authentication step elements
    public get authForm() {
        return $('.auth-form, .bluesky-auth');
    }

    public get blueskyAuthForm() {
        return $('form[name="bluesky-auth"], .auth-section form');
    }

    // Config step elements
    public get configOptions() {
        return $('.config-options, .migration-config');
    }

    public get migrationConfigForm() {
        return $('.config-section, .migration-settings');
    }

    // Migrate step elements
    public get migrationProgress() {
        return $('.migration-progress, .progress-interface');
    }

    public get migrationProgressBar() {
        return $('.progress-bar, mat-progress-bar');
    }

    // Complete step elements
    public get completionConfirmation() {
        return $('.completion-message, .migration-complete');
    }

    public get completionSuccessMessage() {
        return $('.success-message, .completion-confirmation');
    }

    // Splash screen elements
    public get splashScreen() {
        return $('shared-splash-screen');
    }

    public get splashScreenMessage() {
        return $('shared-splash-screen span');
    }

    public get splashScreenSpinner() {
        return $('shared-splash-screen mat-spinner');
    }

    // Methods for step operations
    public async getCurrentStepName() {
        const url = await browser.getUrl();
        const stepMatch = url.match(/\/step\/(\w+)/);
        return stepMatch ? stepMatch[1] : null;
    }

    public async isOnStep(stepName: string) {
        const currentUrl = await browser.getUrl();
        return currentUrl.includes(`/step/${stepName}`);
    }

    public async getCurrentStepHighlight() {
        const activeIndicator = await this.currentStepIndicator;
        if (await activeIndicator.isExisting()) {
            return await activeIndicator.getAttribute('data-step') || 
                   await activeIndicator.getText();
        }
        return null;
    }

    public async navigateToStep(stepName: string) {
        await browser.url(`/step/${stepName}`);
        await browser.waitUntil(
            async () => await this.isOnStep(stepName),
            { timeout: 5000, timeoutMsg: `Navigation to ${stepName} step failed` }
        );
    }

    public async clickNextStep() {
        const nextButton = await this.nextButton;
        if (await nextButton.isExisting()) {
            await nextButton.click();
        }
    }

    public async clickPreviousStep() {
        const previousButton = await this.previousButton;
        if (await previousButton.isExisting()) {
            await previousButton.click();
        }
    }

    public async waitForStepLoad(stepName: string) {
        await browser.waitUntil(
            async () => await this.isOnStep(stepName),
            { timeout: 5000, timeoutMsg: `Step ${stepName} did not load` }
        );
        
        // Wait for step-specific content to load
        switch (stepName) {
            case 'upload':
                await $('.upload-section').waitForDisplayed({ timeout: 3000 });
                break;
            case 'auth':
                await this.authForm.waitForDisplayed({ timeout: 3000 });
                break;
            case 'config':
                await this.configOptions.waitForDisplayed({ timeout: 3000 });
                break;
            case 'migrate':
                await this.migrationProgress.waitForDisplayed({ timeout: 3000 });
                break;
            case 'complete':
                await this.completionConfirmation.waitForDisplayed({ timeout: 3000 });
                break;
        }
    }

    // Navigation methods for each step
    public async openUploadStep() {
        await super.open('step/upload');
        await this.stepLayoutContainer.waitForDisplayed({ timeout: 10000 });
    }

    public async openAuthStep() {
        await super.open('step/auth');
        await this.stepLayoutContainer.waitForDisplayed({ timeout: 10000 });
    }

    public async openConfigStep() {
        await super.open('step/config');
        await this.stepLayoutContainer.waitForDisplayed({ timeout: 10000 });
    }

    public async openMigrateStep() {
        await super.open('step/migrate');
        await this.stepLayoutContainer.waitForDisplayed({ timeout: 10000 });
    }

    public async openCompleteStep() {
        await super.open('step/complete');
        await this.stepLayoutContainer.waitForDisplayed({ timeout: 10000 });
    }

    // Splash screen methods
    public async isSplashScreenVisible() {
        try {
            const splashScreen = await this.splashScreen;
            return await splashScreen.isDisplayed();
        } catch (error) {
            // If there's an error checking splash screen visibility, assume it's not visible
            return false;
        }
    }

    public async waitForSplashScreenToAppear(timeout: number = 10000) {
        const splashScreen = await this.splashScreen;
        await splashScreen.waitForDisplayed({
            timeout,
            timeoutMsg: 'Splash screen did not appear within the specified timeout'
        });
    }

    public async waitForSplashScreenToDisappear(timeout: number = 10000) {
        const splashScreen = await this.splashScreen;
        await splashScreen.waitForDisplayed({
            timeout,
            timeoutMsg: 'Splash screen did not disappear within the specified timeout',
            reverse: true
        });
    }

    public async getSplashScreenMessage() {
        const messageElement = await this.splashScreenMessage;
        await messageElement.waitForDisplayed({
            timeout: 5000,
            timeoutMsg: 'Splash screen message did not appear within 5 seconds'
        });
        return await messageElement.getText();
    }

    public async isSplashScreenSpinnerVisible() {
        const spinner = await this.splashScreenSpinner;
        return await spinner.isDisplayed();
    }
}

export default new StepLayoutPage();