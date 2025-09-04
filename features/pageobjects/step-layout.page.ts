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

    // Scroll detection methods
    public async stepLayoutHasScrollBars() {
        const appContent = await this.appContent;
        const scrollHeight = await appContent.getProperty('scrollHeight');
        const clientHeight = await appContent.getProperty('clientHeight');
        return scrollHeight > clientHeight;
    }

    public async stepLayoutFitsViewport() {
        const appContent = await this.appContent;
        const rect = await appContent.getRect();
        const viewportHeight = await browser.getWindowSize();
        return rect.height <= viewportHeight.height;
    }

    public async stepLayoutCausesPageScroll() {
        const bodyScrollHeight = await browser.execute(() => document.body.scrollHeight);
        const windowHeight = await browser.getWindowSize();
        return bodyScrollHeight > windowHeight.height;
    }

    public async stepNavigationFooterVisible() {
        const footer = await this.stepNavigationFooter;
        const isDisplayed = await footer.isDisplayed();
        if (!isDisplayed) return false;
        
        const rect = await footer.getRect();
        const viewportHeight = await browser.getWindowSize();
        return rect.top < viewportHeight.height && rect.bottom <= viewportHeight.height;
    }

    public async stepLayoutContentConstrained() {
        const appContent = await this.appContent;
        const rect = await appContent.getRect();
        const viewportHeight = await browser.getWindowSize();
        return rect.height <= viewportHeight.height * 0.8; // Allow 20% for navigation
    }

    public async stepLayoutHasProperSpacing() {
        const appContent = await this.appContent;
        const footer = await this.stepNavigationFooter;
        
        const contentRect = await appContent.getRect();
        const footerRect = await footer.getRect();
        
        return footerRect.top > contentRect.bottom; // Footer should be below content
    }

    public async stepLayoutOverflowsViewport() {
        const appContent = await this.appContent;
        const rect = await appContent.getRect();
        const viewportHeight = await browser.getWindowSize();
        return rect.bottom > viewportHeight.height;
    }

    public async stepLayoutFitsMobileViewport() {
        const viewportSize = await browser.getWindowSize();
        if (viewportSize.width > 768) return true; // Not mobile
        
        const appContent = await this.appContent;
        const rect = await appContent.getRect();
        return rect.height <= viewportSize.height;
    }

    public async stepLayoutFitsTabletViewport() {
        const viewportSize = await browser.getWindowSize();
        if (viewportSize.width <= 768 || viewportSize.width > 1024) return true; // Not tablet
        
        const appContent = await this.appContent;
        const rect = await appContent.getRect();
        return rect.height <= viewportSize.height;
    }

    public async stepLayoutFitsDesktopViewport() {
        const viewportSize = await browser.getWindowSize();
        if (viewportSize.width <= 1024) return true; // Not desktop
        
        const appContent = await this.appContent;
        const rect = await appContent.getRect();
        return rect.height <= viewportSize.height;
    }

    public async stepLayoutIsAccessible() {
        const appContent = await this.appContent;
        const isDisplayed = await appContent.isDisplayed();
        const isEnabled = await appContent.isEnabled();
        return isDisplayed && isEnabled;
    }

    public async isBodyScrollable() {
        const bodyScrollHeight = await browser.execute(() => document.body.scrollHeight);
        const windowHeight = await browser.getWindowSize();
        return bodyScrollHeight > windowHeight.height;
    }

    public async pageContentMoved() {
        // Check if content has moved from its original position
        const appContent = await this.appContent;
        const rect = await appContent.getRect();
        return rect.top !== 0; // Content should start at top
    }

    public async onlyStepLayoutScrollable() {
        const bodyScrollable = await this.isBodyScrollable();
        const stepLayoutScrollable = await this.stepLayoutHasScrollBars();
        return !bodyScrollable && stepLayoutScrollable;
    }

    public async pageReturnedToOriginalState() {
        const bodyScrollable = await this.isBodyScrollable();
        const contentAtTop = await this.pageContentMoved();
        return bodyScrollable && !contentAtTop;
    }

    public async hasScrollIssues() {
        const hasScrollBars = await this.stepLayoutHasScrollBars();
        const causesPageScroll = await this.stepLayoutCausesPageScroll();
        const overflowsViewport = await this.stepLayoutOverflowsViewport();
        return hasScrollBars || causesPageScroll || overflowsViewport;
    }

    public async hasLayoutProblems() {
        const hasScrollIssues = await this.hasScrollIssues();
        const contentMoved = await this.pageContentMoved();
        const improperSpacing = !(await this.stepLayoutHasProperSpacing());
        return hasScrollIssues || contentMoved || improperSpacing;
    }

    public async stepLayoutAdaptedToSize() {
        const fitsViewport = await this.stepLayoutFitsViewport();
        const isAccessible = await this.stepLayoutIsAccessible();
        return fitsViewport && isAccessible;
    }

    public async stepLayoutHasFixedViewport() {
        const appContent = await this.appContent;
        const computedStyle = await browser.execute((element) => {
            const styles = window.getComputedStyle(element);
            return {
                height: styles.height,
                overflow: styles.overflow,
                position: styles.position
            };
        }, appContent);
        
        return computedStyle.height === '100vh' && 
               computedStyle.overflow === 'hidden' && 
               computedStyle.position === 'fixed';
    }

    public async stepContentNotOverflowViewport() {
        const overflows = await this.stepLayoutOverflowsViewport();
        return !overflows;
    }

    public async stepNavigationRemainsAccessible() {
        const footer = await this.stepNavigationFooter;
        const isDisplayed = await footer.isDisplayed();
        const isEnabled = await footer.isEnabled();
        return isDisplayed && isEnabled;
    }

    public async noVerticalScrollingPossible() {
        const hasScrollBars = await this.stepLayoutHasScrollBars();
        const causesPageScroll = await this.stepLayoutCausesPageScroll();
        return !hasScrollBars && !causesPageScroll;
    }

    // Device size methods
    public async resizeToMobileSize() {
        await browser.setWindowSize(375, 667); // iPhone SE size
    }

    public async resizeToTabletSize() {
        await browser.setWindowSize(768, 1024); // iPad size
    }

    public async resizeToDesktopSize() {
        await browser.setWindowSize(1200, 800); // Desktop size
    }

    // Navigation methods
    public async navigateToAnyStep() {
        const steps = ['upload', 'auth', 'config', 'migrate', 'complete'];
        const randomStep = steps[Math.floor(Math.random() * steps.length)];
        await this.navigateToStep(randomStep);
    }

    public async rapidlyNavigateBetweenSteps() {
        const steps = ['upload', 'auth', 'config'];
        for (let i = 0; i < 3; i++) {
            const step = steps[i];
            await this.navigateToStep(step);
            // Wait for step to load before proceeding
            await browser.waitUntil(
                async () => await this.isOnStep(step),
                { timeout: 2000, timeoutMsg: `Step ${step} did not load within 2 seconds` }
            );
        }
    }
}

export default new StepLayoutPage();