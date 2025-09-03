import { Given, When, Then, After } from '@wdio/cucumber-framework';
import { pages } from '../pageobjects';
import { browser } from '@wdio/globals';

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