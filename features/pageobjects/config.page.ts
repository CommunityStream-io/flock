import Page from './page';
import { timeouts, timeoutMessages } from '../support/timeout-config';

class ConfigStepPage extends Page {
    // Main configuration form elements
    public get configForm() {
        return $('form[formGroup]');
    }

    public get configSection() {
        return $('.config-section');
    }

    public get configHeading() {
        return $('.config-section h2');
    }

    public get configDescription() {
        return $('.config-section p');
    }

    // Date range section
    public get dateRangeSection() {
        return $('.date-range-section');
    }

    public get dateRangeHeading() {
        return $('.date-range-section h3');
    }

    public get startDateInput() {
        return $('input[formControlName="startDate"]');
    }

    public get endDateInput() {
        return $('input[formControlName="endDate"]');
    }

    public get clearDatesButton() {
        return $('button[data-testid="clear-dates"]');
    }

    public get startDateError() {
        return $('.start-date-error, .mat-error');
    }

    public get endDateError() {
        return $('.end-date-error, .mat-error');
    }

    // Testing options section
    public get testingOptionsSection() {
        return $('.testing-options-section');
    }

    public get testingOptionsHeading() {
        return $('.testing-options-section h3');
    }

    public get testVideoModeToggle() {
        return $('mat-slide-toggle[formControlName="testVideoMode"]');
    }

    public get simulationModeToggle() {
        return $('mat-slide-toggle[formControlName="simulationMode"]');
    }

    public get testVideoModeLabel() {
        return $('mat-slide-toggle[formControlName="testVideoMode"] label');
    }

    public get simulationModeLabel() {
        return $('mat-slide-toggle[formControlName="simulationMode"] label');
    }

    // Form validation elements
    public get formErrors() {
        return $$('.mat-error, .error-message');
    }

    public get validationSuccessIndicators() {
        return $$('.mat-success, .success-indicator');
    }

    public get formStateIndicators() {
        return $('.form-state-indicators');
    }

    // Navigation elements
    public get backButton() {
        return $('button[data-testid="back-button"]');
    }

    public get nextButton() {
        return $('button[data-testid="next-button"]');
    }

    public get progressIndicator() {
        return $('.progress-indicator');
    }

    public get stepIndicator() {
        return $('.step-indicator');
    }

    // Help dialog elements
    public get helpIcon() {
        return $('button[data-testid="help-icon"]');
    }

    public get helpDialog() {
        return $('.help-dialog, .mat-dialog-container');
    }

    public get helpDialogTitle() {
        return $('.help-dialog h2, .mat-dialog-title');
    }

    public get helpDialogContent() {
        return $('.help-dialog .content, .mat-dialog-content');
    }

    public get helpDialogCloseButton() {
        return $('.help-dialog .close-button, .mat-dialog-close');
    }

    // Accessibility elements
    public get formAriaLabel() {
        return $('form[aria-label]');
    }

    public get fieldAriaLabels() {
        return $$('input[aria-label], mat-slide-toggle[aria-label]');
    }

    public get errorAriaLive() {
        return $('[aria-live="polite"]');
    }

    // Methods for date range operations
    public async enterStartDate(date: string) {
        const startDateInput = await this.startDateInput;
        await startDateInput.clearValue();
        await startDateInput.setValue(date);
        console.log(`🔧 BDD: Entered start date: ${date}`);
    }

    public async enterEndDate(date: string) {
        const endDateInput = await this.endDateInput;
        await endDateInput.clearValue();
        await endDateInput.setValue(date);
        console.log(`🔧 BDD: Entered end date: ${date}`);
    }

    public async clearDates() {
        const clearButton = await this.clearDatesButton;
        await clearButton.click();
        console.log(`⚙️ BDD: Cleared date fields`);
    }

    public async getStartDateValue() {
        const startDateInput = await this.startDateInput;
        return await startDateInput.getValue();
    }

    public async getEndDateValue() {
        const endDateInput = await this.endDateInput;
        return await endDateInput.getValue();
    }

    // Methods for testing options
    public async enableTestVideoMode() {
        const toggle = await this.testVideoModeToggle;
        const isChecked = await toggle.getAttribute('aria-checked');
        if (isChecked === 'false') {
            await toggle.click();
        }
        console.log(`⚙️ BDD: Enabled test video mode`);
    }

    public async disableTestVideoMode() {
        const toggle = await this.testVideoModeToggle;
        const isChecked = await toggle.getAttribute('aria-checked');
        if (isChecked === 'true') {
            await toggle.click();
        }
        console.log(`⚙️ BDD: Disabled test video mode`);
    }

    public async enableSimulationMode() {
        const toggle = await this.simulationModeToggle;
        const isChecked = await toggle.getAttribute('aria-checked');
        if (isChecked === 'false') {
            await toggle.click();
        }
        console.log(`⚙️ BDD: Enabled simulation mode`);
    }

    public async disableSimulationMode() {
        const toggle = await this.simulationModeToggle;
        const isChecked = await toggle.getAttribute('aria-checked');
        if (isChecked === 'true') {
            await toggle.click();
        }
        console.log(`⚙️ BDD: Disabled simulation mode`);
    }

    public async isTestVideoModeEnabled() {
        const toggle = await this.testVideoModeToggle;
        const isChecked = await toggle.getAttribute('aria-checked');
        return isChecked === 'true';
    }

    public async isSimulationModeEnabled() {
        const toggle = await this.simulationModeToggle;
        const isChecked = await toggle.getAttribute('aria-checked');
        return isChecked === 'true';
    }

    // Methods for form validation
    public async isFormValid() {
        try {
            const form = await this.configForm;
            const isValid = await form.getAttribute('class');
            return !isValid.includes('ng-invalid');
        } catch (error) {
            return false;
        }
    }

    public async hasValidationErrors() {
        const errors = await this.formErrors;
        return (await errors.length) > 0;
    }

    public async getValidationErrors() {
        const errors = await this.formErrors;
        const errorTexts: string[] = [];
        for (const error of errors) {
            const text = await error.getText();
            errorTexts.push(text);
        }
        return errorTexts;
    }

    public async hasStartDateError() {
        const error = await this.startDateError;
        return await error.isDisplayed();
    }

    public async hasEndDateError() {
        const error = await this.endDateError;
        return await error.isDisplayed();
    }

    public async getStartDateErrorText() {
        const error = await this.startDateError;
        return await error.getText();
    }

    public async getEndDateErrorText() {
        const error = await this.endDateError;
        return await error.getText();
    }

    // Methods for help dialog
    public async openHelpDialog() {
        const helpIcon = await this.helpIcon;
        await helpIcon.click();
        console.log(`⚙️ BDD: Opened help dialog`);
    }

    public async closeHelpDialog() {
        const closeButton = await this.helpDialogCloseButton;
        await closeButton.click();
        console.log(`⚙️ BDD: Closed help dialog`);
    }

    public async closeHelpDialogWithEscape() {
        await browser.keys('Escape');
        console.log(`⚙️ BDD: Closed help dialog with Escape key`);
    }

    public async isHelpDialogVisible() {
        const dialog = await this.helpDialog;
        return await dialog.isDisplayed();
    }

    public async getHelpDialogContent() {
        const content = await this.helpDialogContent;
        return await content.getText();
    }

    // Methods for navigation
    public async clickNextButton() {
        const nextButton = await this.nextButton;
        await nextButton.click();
        console.log(`⚙️ BDD: Clicked Next button`);
    }

    public async clickBackButton() {
        const backButton = await this.backButton;
        await backButton.click();
        console.log(`⚙️ BDD: Clicked Back button`);
    }

    public async isNextButtonEnabled() {
        const nextButton = await this.nextButton;
        return await nextButton.isEnabled();
    }

    public async isBackButtonEnabled() {
        const backButton = await this.backButton;
        return await backButton.isEnabled();
    }

    // Methods for form state
    public async isFormDirty() {
        try {
            const form = await this.configForm;
            const classes = await form.getAttribute('class');
            return classes.includes('ng-dirty');
        } catch (error) {
            return false;
        }
    }

    public async isFormPristine() {
        try {
            const form = await this.configForm;
            const classes = await form.getAttribute('class');
            return classes.includes('ng-pristine');
        } catch (error) {
            return false;
        }
    }

    public async isFormTouched() {
        try {
            const form = await this.configForm;
            const classes = await form.getAttribute('class');
            return classes.includes('ng-touched');
        } catch (error) {
            return false;
        }
    }

    // Methods for accessibility
    public async hasProperAriaLabels() {
        const ariaLabels = await this.fieldAriaLabels;
        return (await ariaLabels.length) > 0;
    }

    public async getFormAriaLabel() {
        const form = await this.formAriaLabel;
        return await form.getAttribute('aria-label');
    }

    // Methods for configuration persistence
    public async configureValidSettings() {
        await this.enableTestVideoMode();
        await this.enableSimulationMode();
        await this.enterStartDate('2023-01-01');
        await this.enterEndDate('2023-12-31');
        console.log(`🔧 BDD: Configured valid settings`);
    }

    public async configureTestVideoMode() {
        await this.enableTestVideoMode();
        console.log(`🔧 BDD: Configured test video mode`);
    }

    public async configureSimulationMode() {
        await this.enableSimulationMode();
        console.log(`🔧 BDD: Configured simulation mode`);
    }

    public async resetFormToDefault() {
        await this.disableTestVideoMode();
        await this.disableSimulationMode();
        await this.clearDates();
        console.log(`🔧 BDD: Reset form to default state`);
    }

    // Help dialog scroll detection methods
    public async clickDateRangeHelpButton() {
        await this.dateRangeHelpButton.click();
    }

    public async clickTestingOptionsHelpButton() {
        await this.testingOptionsHelpButton.click();
    }

    public async isHelpDialogVisible() {
        return await this.helpDialog.isDisplayed();
    }

    public async helpDialogHasScrollBars() {
        const dialogElement = await this.helpDialog;
        const hasVerticalScroll = await dialogElement.getProperty('scrollHeight') > await dialogElement.getProperty('clientHeight');
        const hasHorizontalScroll = await dialogElement.getProperty('scrollWidth') > await dialogElement.getProperty('clientWidth');
        return hasVerticalScroll || hasHorizontalScroll;
    }

    public async helpDialogFitsViewport() {
        const dialogElement = await this.helpDialog;
        const dialogRect = await dialogElement.getRect();
        const viewportSize = await browser.getWindowSize();
        
        return dialogRect.width <= viewportSize.width && dialogRect.height <= viewportSize.height;
    }

    public async helpDialogCausesPageScroll() {
        const bodyElement = await $('body');
        const hasVerticalScroll = await bodyElement.getProperty('scrollHeight') > await bodyElement.getProperty('clientHeight');
        return hasVerticalScroll;
    }

    public async helpDialogFooterVisible() {
        const footerElement = await this.helpDialog.$('.dialog-actions');
        return await footerElement.isDisplayed();
    }

    public async helpDialogContentConstrained() {
        const contentElement = await this.helpDialog.$('.dialog-content');
        const contentHeight = await contentElement.getProperty('scrollHeight');
        const containerHeight = await contentElement.getProperty('clientHeight');
        return contentHeight <= containerHeight;
    }

    public async helpDialogHasProperSpacing() {
        const contentElement = await this.helpDialog.$('.dialog-content');
        const padding = await contentElement.getCSSProperty('padding');
        return parseInt(padding.value) >= 16; // At least 16px padding
    }

    public async helpDialogOverflowsViewport() {
        const dialogElement = await this.helpDialog;
        const dialogRect = await dialogElement.getRect();
        const viewportSize = await browser.getWindowSize();
        
        return dialogRect.right > viewportSize.width || dialogRect.bottom > viewportSize.height;
    }

    public async helpDialogFitsMobileViewport() {
        const dialogElement = await this.helpDialog;
        const dialogRect = await dialogElement.getRect();
        return dialogRect.width <= 375 && dialogRect.height <= 667;
    }

    public async helpDialogFitsTabletViewport() {
        const dialogElement = await this.helpDialog;
        const dialogRect = await dialogElement.getRect();
        return dialogRect.width <= 768 && dialogRect.height <= 1024;
    }

    public async helpDialogIsAccessible() {
        const dialogElement = await this.helpDialog;
        const hasAriaLabel = await dialogElement.getAttribute('aria-label');
        const hasRole = await dialogElement.getAttribute('role');
        return !!(hasAriaLabel || hasRole);
    }

    public async isBodyScrollable() {
        const bodyElement = await $('body');
        const hasScrollClass = await bodyElement.getAttribute('class');
        return !hasScrollClass?.includes('dialog-open');
    }

    public async pageContentMoved() {
        // Check if page content has shifted due to dialog
        const configSection = await this.configSection;
        const originalPosition = await configSection.getLocation();
        
        // Small delay to check for movement
        // Wait for input to be processed
        await browser.waitUntil(
            async () => {
                const value = await this.startDateField.getValue();
                return value === date;
            },
            { timeout: timeouts.uiInteraction, timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true') }
        );
        
        const currentPosition = await configSection.getLocation();
        return originalPosition.x !== currentPosition.x || originalPosition.y !== currentPosition.y;
    }

    public async onlyHelpDialogScrollable() {
        const bodyElement = await $('body');
        const bodyScrollable = await this.isBodyScrollable();
        const dialogScrollable = await this.helpDialogHasScrollBars();
        
        return !bodyScrollable && dialogScrollable;
    }

    public async closeHelpDialog() {
        const closeButton = await this.helpDialog.$('.close-button');
        await closeButton.click();
    }

    public async pageReturnedToOriginalState() {
        const bodyScrollable = await this.isBodyScrollable();
        const noScrollIssues = !(await this.hasScrollIssues());
        return bodyScrollable && noScrollIssues;
    }

    public async hasScrollIssues() {
        const bodyElement = await $('body');
        const hasScrollClass = await bodyElement.getAttribute('class');
        const hasUnexpectedScroll = await this.helpDialogCausesPageScroll();
        
        return hasScrollClass?.includes('dialog-open') || hasUnexpectedScroll;
    }

    public async hasLayoutProblems() {
        const contentMoved = await this.pageContentMoved();
        const hasScrollIssues = await this.hasScrollIssues();
        return contentMoved || hasScrollIssues;
    }

    public async navigateDialogWithTab() {
        const dialogElement = await this.helpDialog;
        await dialogElement.keys('Tab');
        // Wait for input to be processed
        await browser.waitUntil(
            async () => {
                const value = await this.startDateField.getValue();
                return value === date;
            },
            { timeout: timeouts.uiInteraction, timeoutMsg: timeoutMessages.uiInteraction(process.env.CI === 'true') }
        );
    }

    public async focusedElementVisible() {
        const focusedElement = await browser.$(await browser.getActiveElement());
        return await focusedElement.isDisplayed();
    }

    public async dialogScrolledUnexpectedly() {
        const dialogElement = await this.helpDialog;
        const scrollTop = await dialogElement.getProperty('scrollTop');
        return scrollTop > 0;
    }

    public async dialogHasProperFocusManagement() {
        const dialogElement = await this.helpDialog;
        const focusedElement = await browser.$(await browser.getActiveElement());
        return await dialogElement.$(focusedElement.selector).isExisting();
    }

    public async helpDialogAdaptedToSize() {
        const dialogElement = await this.helpDialog;
        const dialogRect = await dialogElement.getRect();
        const viewportSize = await browser.getWindowSize();
        
        return dialogRect.width <= viewportSize.width && dialogRect.height <= viewportSize.height;
    }

    // Navigation
    public async open() {
        await super.open('step/config');
        // WebdriverIO auto-waits for elements to be interactable when we use them
    }
}

export default new ConfigStepPage();
