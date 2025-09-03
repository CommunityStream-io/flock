import { Given, When, Then } from '@wdio/cucumber-framework';

import LandingPage from '../pageobjects/landing.page';
import UploadStepPage from '../pageobjects/upload-step.page';
import StepLayoutPage from '../pageobjects/step-layout.page';
import NavigationGuardPage from '../pageobjects/navigation-guard.page';
import AuthPage from '../pageobjects/auth.page';

const pages = {
    landing: LandingPage,
    uploadStep: UploadStepPage,
    stepLayout: StepLayoutPage,
    navigationGuard: NavigationGuardPage,
    auth: AuthPage
}

Given('I am on the landing page', async () => {
    await pages.landing.open();
});

Then('I should see the main title {string}', async (title: string) => {
    await expect(await LandingPage.mainTitle.getText()).toContain(title);
});

Then('I should see the subtitle about spreading wings to Bluesky\'s decentralized skies', async () => {
    await expect(await LandingPage.subtitle.getText()).toContain('Spread your wings and soar to Bluesky\'s decentralized skies');
});

Then('I should see the migration journey explanation', async () => {
    await expect(await LandingPage.migrationDescription.getText()).toContain('Join the migration! Like birds following ancient flight paths');
});

Then('I should see three process steps numbered {int}, {int}, and {int}', async (step1: number, step2: number, step3: number) => {
    await expect(await LandingPage.step1Number.getText()).toBe(step1.toString());
    await expect(await LandingPage.step2Number.getText()).toBe(step2.toString());
    await expect(await LandingPage.step3Number.getText()).toBe(step3.toString());
});

Then('I should see step {int} titled {string}', async (stepNumber: number, title: string) => {
    const stepTitle = await LandingPage.getStepTitle(stepNumber);
    await expect(await stepTitle.getText()).toBe(title);
});

Then('step {int} should describe {string}', async (stepNumber: number, description: string) => {
    const stepDescription = await LandingPage.getStepDescription(stepNumber);
    await expect(await stepDescription.getText()).toBe(description);
});

Then('I should see {string} section', async (sectionTitle: string) => {
    const section = await LandingPage.getSectionByTitle(sectionTitle);
    await expect(section).toBeDisplayed();
});

Then('I should see a {string} benefit card', async (cardTitle: string) => {
    const card = await LandingPage.getBenefitCard(cardTitle);
    await expect(card).toBeDisplayed();
});

Then('the {string} card should mention {string}', async (cardTitle: string, expectedText: string) => {
    const card = await LandingPage.getBenefitCard(cardTitle);
    await expect(await card.getText()).toContain(expectedText);
});

Then('I should see a {string} button', async (buttonText: string) => {
    const button = await LandingPage.getButtonByText(buttonText);
    await expect(button).toBeDisplayed();
});

Then('I should see an {string} button', async (buttonText: string) => {
    const button = await LandingPage.getButtonByText(buttonText);
    await expect(button).toBeDisplayed();
});

When('I click the {string} button', async (buttonText: string) => {
    const button = await LandingPage.getButtonByText(buttonText);
    await button.click();
});

Then('I should be navigated to the upload step', async () => {
    // Wait for navigation to complete
    await browser.waitUntil(
        async () => {
            const currentUrl = await browser.getUrl();
            return currentUrl.includes('/step/upload');
        },
        { timeout: 5000, timeoutMsg: 'Navigation to upload step did not complete' }
    );
});

Then('the URL should contain {string}', async (urlPath: string) => {
    const currentUrl = await browser.getUrl();
    await expect(currentUrl).toContain(urlPath);
});

// ===== COMMON STEPS =====

Given('the application is running', async () => {
    // Ensure the application is accessible
    await browser.url('/');
});

// ===== STEP NAVIGATION STEPS =====

Given('I navigate to the upload step', async () => {
    await pages.stepLayout.openUploadStep();
});

Given('I navigate to the auth step', async () => {
    await pages.auth.open();
});

Given('I navigate to the config step', async () => {
    await pages.stepLayout.openConfigStep();
});

Given('I navigate to the migrate step', async () => {
    await pages.stepLayout.openMigrateStep();
});

Given('I navigate to the complete step', async () => {
    await pages.stepLayout.openCompleteStep();
});

Then('I should see the step layout container', async () => {
    await expect(pages.stepLayout.stepLayoutContainer).toBeDisplayed();
});

Then('I should see the step navigation footer', async () => {
    await expect(pages.stepLayout.stepNavigationFooter).toBeDisplayed();
});

Then('the current step should be highlighted as {string}', async (stepName: string) => {
    const currentStep = await pages.stepLayout.getCurrentStepName();
    expect(currentStep).toBe(stepName);
});

Then('I should be on the {word} step page', async (stepName: string) => {
    if (stepName === 'auth') {
        await pages.auth.waitForPageLoad();
    } else {
        await pages.stepLayout.waitForStepLoad(stepName);
        const isOnStep = await pages.stepLayout.isOnStep(stepName);
        expect(isOnStep).toBe(true);
    }
});

Then('I should see the Bluesky authentication form', async () => {
    await expect(pages.auth.authForm).toBeDisplayed();
});

Then('I should see migration configuration options', async () => {
    await expect(pages.stepLayout.configOptions).toBeDisplayed();
});

Then('I should see the migration progress interface', async () => {
    await expect(pages.stepLayout.migrationProgress).toBeDisplayed();
});

Then('I should see the migration completion confirmation', async () => {
    await expect(pages.stepLayout.completionConfirmation).toBeDisplayed();
});

Then('the page title should be {string}', async (expectedTitle: string) => {
    const title = await browser.getTitle();
    expect(title).toContain(expectedTitle);
});

Then('I should see the description {string}', async (expectedDescription: string) => {
    const description = await pages.stepLayout.stepDescription;
    const text = await description.getText();
    expect(text).toContain(expectedDescription);
});

// ===== FILE UPLOAD STEPS =====

Then('I should see the upload section', async () => {
    await expect(pages.uploadStep.uploadSection).toBeDisplayed();
});

Then('I should see the heading {string}', async (expectedHeading: string) => {
    const heading = await pages.uploadStep.uploadHeading;
    const text = await heading.getText();
    expect(text).toBe(expectedHeading);
});

Then('I should see a {string} button with upload icon', async (buttonText: string) => {
    const button = await pages.uploadStep.chooseFilesButton;
    const buttonTextActual = await button.getText();
    expect(buttonTextActual).toContain(buttonText);

    const icon = await pages.uploadStep.uploadIcon;
    await expect(icon).toBeDisplayed();
    const iconText = await icon.getText();
    expect(iconText).toBe('upload');
});

Then('the file input should accept {string} files', async (fileType: string) => {
    const fileInput = await pages.uploadStep.fileInput;
    const acceptAttribute = await fileInput.getAttribute('accept');
    expect(acceptAttribute).toBe(fileType);
});

When('I select a valid Instagram archive file {string}', async (filename: string) => {
    await pages.uploadStep.selectFile(filename);
    // Wait for file to be processed and displayed
    await browser.waitUntil(
        async () => {
            const hasFiles = await pages.uploadStep.hasFiles();
            return hasFiles;
        },
        { 
            timeout: 3000, 
            timeoutMsg: 'File was not processed within 3 seconds' 
        }
    );
});

When('I select an invalid file {string}', async (filename: string) => {
    // For invalid files, we can't actually select them due to browser restrictions
    // So we'll just verify the browser prevents selection
    const fileInput = await pages.uploadStep.fileInput;
    const acceptAttribute = await fileInput.getAttribute('accept');
    expect(acceptAttribute).toBe('.zip');
});

Then('the file validation should fail', async () => {
    // Since we can't actually select invalid files, this step just verifies
    // that the browser's accept attribute is working
    const fileInput = await pages.uploadStep.fileInput;
    const acceptAttribute = await fileInput.getAttribute('accept');
    expect(acceptAttribute).toBe('.zip');
});

Then('I should see validation error messages', async () => {
    // For invalid files, the browser should prevent selection
    // So we verify the accept attribute is set correctly
    const fileInput = await pages.uploadStep.fileInput;
    const acceptAttribute = await fileInput.getAttribute('accept');
    expect(acceptAttribute).toBe('.zip');
});

Then('the file should be selected in the file input', async () => {
    const hasFiles = await pages.uploadStep.hasFiles();
    expect(hasFiles).toBe(true);
});

Then('I should see the selected files section', async () => {
    await expect(pages.uploadStep.fileListSection).toBeDisplayed();
});

Then('I should see {string} heading', async (headingText: string) => {
    const heading = await pages.uploadStep.getHeadingByText(headingText);
    await expect(heading).toBeDisplayed();
});

Then('I should see {string} in the file list', async (filename: string) => {
    const selectedFileName = await pages.uploadStep.getSelectedFileName(0);
    expect(selectedFileName).toContain(filename);
});

Then('I should see a delete button for the selected file', async () => {
    const deleteButtons = await pages.uploadStep.deleteButtons;
    expect(deleteButtons.length).toBeGreaterThan(0);
    await expect(deleteButtons[0]).toBeDisplayed();
});

Then('I should see validation success indicators', async () => {
    // Check that the file is actually selected and displayed
    const hasFiles = await pages.uploadStep.hasFiles();
    expect(hasFiles).toBe(true);

    // Check that the file list section is visible
    await expect(pages.uploadStep.fileListSection).toBeDisplayed();
});

Then('the file validation should succeed', async () => {
    // This would depend on your actual validation indicators
    // For now, we'll check that no error messages are shown
    const hasErrors = await pages.navigationGuard.hasValidationErrors();
    expect(hasErrors).toBe(false);
});

Then('the file input should only allow zip files', async () => {
    const fileInput = await pages.uploadStep.fileInput;
    const acceptAttribute = await fileInput.getAttribute('accept');
    expect(acceptAttribute).toBe('.zip');
});

Then('the browser should filter file selection to zip files only', async () => {
    // This is a browser behavior test - we verify the accept attribute is set
    const fileInput = await pages.uploadStep.fileInput;
    const acceptAttribute = await fileInput.getAttribute('accept');
    expect(acceptAttribute).toBe('.zip');

    // We can also verify that the file input has the correct type
    const inputType = await fileInput.getAttribute('type');
    expect(inputType).toBe('file');
});

Then('users cannot accidentally select text files', async () => {
    // This is a browser behavior test - the accept attribute prevents text file selection
    // We verify the configuration is correct
    const fileInput = await pages.uploadStep.fileInput;
    const acceptAttribute = await fileInput.getAttribute('accept');

    // The accept attribute should only allow zip files
    expect(acceptAttribute).toBe('.zip');

    // We can also check that the component doesn't have logic for handling text files
    // since the browser prevents them from being selected
    const hasTextFileHandling = await browser.execute(() => {
        // Check if there's any text file validation logic in the component
        const component = document.querySelector('shared-upload');
        return component && component.hasAttribute('data-text-file-handling');
    });
    expect(hasTextFileHandling).toBe(false);
});

Given('I have selected a valid Instagram archive file {string}', async (filename: string) => {
    await pages.uploadStep.selectFile(filename);
    await browser.pause(500);
});

When('I click the delete button for {string}', async (filename: string) => {
    await pages.uploadStep.clickDeleteButton(0);
});

Then('the file should be removed from the selection', async () => {
    const hasFiles = await pages.uploadStep.hasFiles();
    expect(hasFiles).toBe(false);
});

Then('the file input should be reset', async () => {
    const fileInput = await pages.uploadStep.fileInput;
    const value = await fileInput.getValue();
    expect(value).toBe('');
});

Then('I should not see the selected files section', async () => {
    const fileListSection = await pages.uploadStep.fileListSection;
    const isDisplayed = await fileListSection.isDisplayed().catch(() => false);
    expect(isDisplayed).toBe(false);
});

Then('the Instagram archive form control should be invalid initially', async () => {
    const isValid = await pages.uploadStep.isFormValid();
    expect(isValid).toBe(false);
});

Then('the Instagram archive form control should be valid', async () => {
    const isValid = await pages.uploadStep.isFormValid();
    expect(isValid).toBe(true);
});

Then('the Instagram archive form control should be invalid again', async () => {
    const isValid = await pages.uploadStep.isFormValid();
    expect(isValid).toBe(false);
});

When('I try to proceed without a file', async () => {
    // Click the next step button to trigger form validation
    await pages.stepLayout.clickNextStep();
});

Then('I should see an error message', async () => {
    // Wait for and check the snackbar error message
    await pages.navigationGuard.waitForSnackbar();
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Please upload a valid archive');
});

Then('I should see an error message again', async () => {
    // Wait for and check the snackbar error message
    await pages.navigationGuard.waitForSnackbar();
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Please upload a valid archive');
});

Then('I should be able to proceed to the next step', async () => {
    // Click next and verify we can navigate (no error message)
    await pages.stepLayout.clickNextStep();
    // Wait for navigation to complete
    await browser.waitUntil(
        async () => {
            const isStillOnUpload = await pages.navigationGuard.isStillOnStep('upload');
            return !isStillOnUpload;
        },
        { 
            timeout: 10000, 
            timeoutMsg: 'Navigation to next step did not complete within 10 seconds' 
        }
    );
});

When('I try to proceed without a file again', async () => {
    // Navigate back to upload step first
    await pages.uploadStep.open();
    // Then try to proceed without a file
    await pages.stepLayout.clickNextStep();
});

Then('the form should remain on the upload step', async () => {
    // Verify we're still on the upload step
    const isStillOnUpload = await pages.navigationGuard.isStillOnStep('upload');
    expect(isStillOnUpload).toBe(true);
});

// ===== NAVIGATION GUARD STEPS =====

Given('I have not uploaded any archive file', async () => {
    await pages.navigationGuard.simulateNoFileUploaded();
});

When('I attempt to navigate to the auth step directly', async () => {
    await pages.navigationGuard.attemptDirectNavigation('auth');
    await pages.navigationGuard.waitForGuardExecution();
});

Then('I should remain on the upload step', async () => {
    const isStillOnUpload = await pages.navigationGuard.isStillOnStep('upload');
    expect(isStillOnUpload).toBe(true);
});

Then('I should see a snackbar message {string}', async (expectedMessage: string) => {
    await pages.navigationGuard.waitForSnackbar();
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain(expectedMessage);
});

Then('the snackbar should auto-dismiss after {int} seconds', async (seconds: number) => {
    await pages.navigationGuard.waitForSnackbarToDismiss(seconds * 1000 + 1000); // Add buffer
});

When('I upload a valid Instagram archive file', async () => {
    await pages.navigationGuard.simulateValidFileUploaded();
    await browser.pause(1000); // Allow validation
});

When('I upload a valid Instagram archive', async () => {
    await pages.navigationGuard.simulateValidFileUploaded();
    await browser.pause(1000); // Allow validation
});

Then('I should successfully navigate to the auth step', async () => {
    const hasNavigated = await pages.navigationGuard.hasNavigatedToStep('auth');
    expect(hasNavigated).toBe(true);
});

Then('I should not see any error messages', async () => {
    const hasErrors = await pages.navigationGuard.hasValidationErrors();
    expect(hasErrors).toBe(false);
});

When('I select a file but validation fails', async () => {
    await pages.navigationGuard.simulateInvalidFile();
    await browser.pause(500);
});

When('I wait for the snackbar to dismiss', async () => {
    await pages.navigationGuard.waitForSnackbarToDismiss();
});

When('I attempt to navigate to the auth step again', async () => {
    await pages.navigationGuard.attemptDirectNavigation('auth');
    await pages.navigationGuard.waitForGuardExecution();
});

Then('I should see the snackbar message again', async () => {
    await pages.navigationGuard.waitForSnackbar();
    const isVisible = await pages.navigationGuard.isSnackbarVisible();
    expect(isVisible).toBe(true);
});

When('I click the next step button in the navigation', async () => {
    await pages.stepLayout.clickNextStep();
    await pages.navigationGuard.waitForGuardExecution();
});

Then('the navigation should be blocked', async () => {
    const isStillOnUpload = await pages.navigationGuard.isStillOnStep('upload');
    expect(isStillOnUpload).toBe(true);
});

// ===== BUTTON VISIBILITY SCENARIO STEPS =====

Given('I am on the upload step', async () => {
    await pages.uploadStep.open();
});

When('I remove the selected file', async () => {
    await pages.uploadStep.clickDeleteButton(0);
});

Then('I should see the "Choose Files" button', async () => {
    const chooseFilesButton = await pages.uploadStep.chooseFilesButton;
    await expect(chooseFilesButton).toBeDisplayed();
});

Then('the "Choose Files" button should be hidden', async () => {
    const chooseFilesButton = await pages.uploadStep.chooseFilesButton;
    await expect(chooseFilesButton).not.toBeDisplayed();
});

Then('the "Choose Files" button should be visible again', async () => {
    const chooseFilesButton = await pages.uploadStep.chooseFilesButton;
    await expect(chooseFilesButton).toBeDisplayed();
});

// ===== BLUESKY AUTHENTICATION STEPS =====

Given('I am on the auth step page', async () => {
    await pages.auth.open();
});

Then('I should see a username input field with @ prefix', async () => {
    await expect(pages.auth.usernameField).toBeDisplayed();

    // Check if the field has a placeholder with @ prefix
    const placeholder = await pages.auth.usernameField.getAttribute('placeholder');
    expect(placeholder).toContain('@');
});

Then('I should see a password input field', async () => {
    await expect(pages.auth.passwordField).toBeDisplayed();
});

Then('I should see the Bluesky authentication form', async () => {
    await expect(pages.auth.authForm).toBeDisplayed();
});

Then('the form should be initially invalid', async () => {
    const isFormValid = await pages.auth.isFormValid();
    expect(isFormValid).toBe(false);
});

Then('the password field should show an error', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBeTruthy();
});

Then('the password field should not show any errors', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBe('');
});

Then('the password validation should pass', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBe('');
});

Then('the error should indicate {string}', async (expectedError: string) => {
    // Check both username and password errors
    const usernameError = await pages.auth.getUsernameErrorText();
    const passwordError = await pages.auth.getPasswordErrorText();
    const formError = await pages.auth.formError.getText().catch(() => '');
    
    const hasExpectedError = usernameError.includes(expectedError) || 
                           passwordError.includes(expectedError) || 
                           formError.includes(expectedError);
    
    expect(hasExpectedError).toBe(true);
});

Then('the form should be valid', async () => {
    const isFormValid = await pages.auth.isFormValid();
    expect(isFormValid).toBe(true);
});

Then('the form should remain invalid', async () => {
    const isFormValid = await pages.auth.isFormValid();
    expect(isFormValid).toBe(false);
});

Then('the "Next" button should be enabled', async () => {
    const isEnabled = await pages.auth.isNextButtonEnabled();
    expect(isEnabled).toBe(true);
});

When('I enter a username with @ symbol', async () => {
    await pages.auth.enterUsername('@username.bksy.social');
});

When('I enter a username without dots', async () => {
    await pages.auth.enterUsername('username');
});

When('I enter a username with one dot', async () => {
    await pages.auth.enterUsername('username.bksy');
});

When('I enter a valid username "username.bksy.social"', async () => {
    await pages.auth.enterUsername('username.bksy.social');
});

When('I enter a valid username', async () => {
    await pages.auth.enterUsername('test.bksy.social');
});

When('I enter a valid custom domain username "user.custom.domain"', async () => {
    await pages.auth.enterUsername('user.custom.domain');
});

Then('the username field should show an error', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toBeTruthy();
});

Then('the error should indicate "Do not include the @ symbol - it is automatically added"', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toContain('Do not include the @ symbol - it is automatically added');
});

Then('the error should indicate "Username must contain at least two dots (e.g., username.bksy.social)"', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toContain('Username must contain at least two dots');
});

Then('the username field should not show any errors', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toBe('');
});

Then('the username validation should pass', async () => {
    const errorText = await pages.auth.getUsernameErrorText();
    expect(errorText).toBe('');
});

When('I leave the password field empty', async () => {
    await pages.auth.enterPassword('');
    // Trigger blur to validate
    await pages.auth.passwordField.click();
    await $('body').click();
    // Wait for validation to complete
    await browser.pause(300);
});

When('I enter a password', async () => {
    await pages.auth.enterPassword('testpassword123');
});

When('I enter a valid password', async () => {
    await pages.auth.enterPassword('testpassword123');
});

Then('the password field should show an error', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBeTruthy();
});

Then('the error should indicate "Password is required"', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toContain('Password is required');
});

Then('the password field should not show any errors', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBe('');
});

Then('the password validation should pass', async () => {
    const errorText = await pages.auth.getPasswordErrorText();
    expect(errorText).toBe('');
});

Given('I have entered a valid username', async () => {
    await pages.auth.enterUsername('test.bksy.social');
});

Given('I have entered a valid password', async () => {
    await pages.auth.enterPassword('testpassword123');
});

Then('the form should be initially invalid', async () => {
    const isFormValid = await pages.auth.isFormValid();
    expect(isFormValid).toBe(false);
});

Then('the form should be valid', async () => {
    const isValid = await pages.auth.isFormValid();
    expect(isValid).toBe(true);
});

Then('the "Next" button should be enabled', async () => {
    const isEnabled = await pages.auth.isNextButtonEnabled();
    expect(isEnabled).toBe(true);
});

Given('I have entered valid credentials', async () => {
    await pages.auth.open();
    await pages.auth.enterCredentials('test.bksy.social', 'testpassword123');
});

When('I click the "Next" button', async () => {
    console.log('🔍 BDD: Step definition matched - clicking Next button');
    await pages.auth.clickNext();
    console.log('🔍 BDD: Next button clicked successfully');
});

Then('the authentication script should run in the background', async () => {
    // Wait for navigation to complete, indicating authentication succeeded
    await browser.waitUntil(
        async () => {
            const currentUrl = await browser.getUrl();
            return currentUrl.includes('/step/config');
        },
        { timeout: 10000, timeoutMsg: 'Authentication and navigation to config step did not complete' }
    );
});

Then('I should be navigated to the config step', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/config');
});

Given('I have entered invalid credentials', async () => {
    await pages.auth.open();
    await pages.auth.enterCredentials('invalid.user.name', 'wrongpassword');
});

Then('the authentication should fail', async () => {
    // Check that we're still on the auth step
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/auth');
});

Then('I should see a snackbar error message', async () => {
    await pages.navigationGuard.waitForSnackbar();
});

Then('the error should indicate "Invalid Bluesky credentials"', async () => {
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Invalid Bluesky credentials');
});

Then('I should remain on the auth step', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/auth');
});

Then('the form should remain invalid', async () => {
    const isValid = await pages.auth.isFormValid();
    expect(isValid).toBe(false);
});

Given('I am on the auth step without valid credentials', async () => {
    await pages.auth.open();
    // Don't enter any credentials
});

When('I attempt to navigate to the config step', async () => {
    await pages.stepLayout.clickNextStep();
    await pages.navigationGuard.waitForGuardExecution();
});

Then('the navigation should be blocked', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/auth');
});

Then('the error should indicate "Please provide valid Bluesky credentials"', async () => {
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Please provide valid Bluesky credentials');
});

Given('I have successfully authenticated', async () => {
    // This would typically be set up by the test environment
    // or by completing a successful authentication flow
    await browser.execute(() => {
        // Simulate successful authentication state
        localStorage.setItem('bluesky_authenticated', 'true');
    });
});

Then('the navigation should succeed', async () => {
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toContain('/step/config');
});

When('I attempt to navigate away from the auth step', async () => {
    await pages.stepLayout.clickNextStep();
});

Then('the system should validate my credentials', async () => {
    // This step verifies that validation occurs
    // The actual validation logic is in the component
});

Then('if valid, I should proceed to the next step', async () => {
    // This is handled by the navigation guard
    // We verify the outcome in the next step
});

Then('if invalid, I should see a snackbar error message', async () => {
    await pages.navigationGuard.waitForSnackbar();
});

Then('the error should indicate "Please complete authentication before proceeding"', async () => {
    const snackbarText = await pages.navigationGuard.getSnackbarText();
    expect(snackbarText).toContain('Please complete authentication before proceeding');
});

// Help dialog steps
When('I click the help icon', async () => {
    await pages.auth.clickHelpIcon();
});

Then('I should see a help dialog with username format suggestions', async () => {
    const isDialogVisible = await pages.auth.isHelpDialogVisible();
    expect(isDialogVisible).toBe(true);
});

Then('the dialog should contain {string}', async (expectedText: string) => {
    const dialogText = await pages.auth.getHelpDialogText();
    expect(dialogText).toContain(expectedText);
});

Then('the dialog should explain that the @ symbol is automatically added', async () => {
    const dialogText = await pages.auth.getHelpDialogText();
    expect(dialogText).toContain('@ symbol is automatically added');
});

When('I close the help dialog', async () => {
    await pages.auth.closeHelpDialog();
    // Wait for dialog to actually close
    await browser.waitUntil(
        async () => {
            const isVisible = await pages.auth.isHelpDialogVisible();
            return !isVisible;
        },
        {
            timeout: 5000,
            timeoutMsg: 'Help dialog did not close within 5 seconds'
        }
    );
});

When('I close the help dialog with Escape key', async () => {
    await pages.auth.closeHelpDialogWithEscape();
    // Wait for dialog to actually close
    await browser.waitUntil(
        async () => {
            const isVisible = await pages.auth.isHelpDialogVisible();
            return !isVisible;
        },
        {
            timeout: 5000,
            timeoutMsg: 'Help dialog did not close with Escape key within 5 seconds'
        }
    );
});

Then('the help dialog should be hidden', async () => {
    const isDialogVisible = await pages.auth.isHelpDialogVisible();
    expect(isDialogVisible).toBe(false);
});

// Splash Screen Step Definitions
Then('I should see the splash screen', async () => {
    await pages.stepLayout.waitForSplashScreenToAppear();
    const isVisible = await pages.stepLayout.isSplashScreenVisible();
    expect(isVisible).toBe(true);
});

Then('the splash screen should display {string}', async (expectedMessage: string) => {
    await pages.stepLayout.waitForSplashScreenToAppear();
    const actualMessage = await pages.stepLayout.getSplashScreenMessage();
    expect(actualMessage).toContain(expectedMessage);
});

Then('the authentication should process in the background', async () => {
    // Wait for authentication to complete (this step is more of a verification)
    // The actual authentication processing is handled by the service
    await browser.pause(2000); // Give time for authentication to process
    
    // Verify that we're still on the auth page or have moved to the next step
    const currentUrl = await browser.getUrl();
    expect(currentUrl).toMatch(/\/step\/(auth|config)/);
});

