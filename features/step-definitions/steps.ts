import { Given, When, Then } from '@wdio/cucumber-framework';

import LandingPage from '../pageobjects/landing.page';

const pages = {
    landing: LandingPage
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

