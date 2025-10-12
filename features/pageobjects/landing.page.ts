import Page from './page';

class LandingPage extends Page {
    // Main landing page container
    public get landingPageContainer() {
        return $('.landing-page');
    }

    // Intro section elements
    public get introSection() {
        return $('.intro-section');
    }

    public get introCard() {
        return $('.intro-card');
    }

    public get mainTitle() {
        return $('mat-card-title');
    }

    public get subtitle() {
        return $('mat-card-subtitle');
    }

    public get migrationDescription() {
        return $('.intro-card mat-card-content p');
    }

    // Process steps section
    public get migrationJourneySection() {
        return $('.section-title');
    }

    public get processSteps() {
        return $$('.process-step');
    }

    public get step1() {
        return $('.process-step:nth-child(1)');
    }

    public get step2() {
        return $('.process-step:nth-child(2)');
    }

    public get step3() {
        return $('.process-step:nth-child(3)');
    }

    public get step1Number() {
        return $('.process-step:nth-child(1) .step-number');
    }

    public get step2Number() {
        return $('.process-step:nth-child(2) .step-number');
    }

    public get step3Number() {
        return $('.process-step:nth-child(3) .step-number');
    }

    // Benefits section
    public get benefitCards() {
        return $$('.info-card');
    }

    // Buttons
    public get beginJourneyButton() {
        return $('shared-start-button button');
    }

    public get exploreSkiesButton() {
        return $('button[mat-stroked-button]');
    }

    // Methods for dynamic element selection
    public async getStepTitle(stepNumber: number) {
        // Wait for process flow to be visible first
        await $('.process-flow').waitForDisplayed({ timeout: 5000 });
        
        // Get all step titles using a more direct approach
        const titles = await $$('.process-flow .process-step mat-card-title');
        
        // Wait for the specific title to be visible
        await titles[stepNumber - 1].waitForDisplayed({ timeout: 3000 });
        
        // Wait for text content to be populated (Material animation delay)
        await browser.waitUntil(
            async () => {
                const text = await titles[stepNumber - 1].getText();
                return text.length > 0;
            },
            { 
                timeout: 3000,
                interval: 200,
                timeoutMsg: `Step ${stepNumber} title text not populated after animation`
            }
        );
        
        return titles[stepNumber - 1];
    }

    public async getStepDescription(stepNumber: number) {
        // WebdriverIO auto-waits for elements to be interactable when we use them
        const step = $(`.process-flow .process-step:nth-child(${stepNumber})`);
        return step.$('mat-card-content p');
    }

    public async getSectionByTitle(sectionTitle: string) {
        // Use the specific section-title class
        const allSectionTitles = await $$('.section-title');
        for (const section of allSectionTitles) {
            const text = await section.getText();
            if (text.includes(sectionTitle)) {
                return section;
            }
        }
        throw new Error(`Section with title "${sectionTitle}" not found`);
    }

    public async getBenefitCard(cardTitle: string) {
        // Use the info-card class and mat-card-title
        const allCards = await $$('.info-card');
        for (const card of allCards) {
            const title = await card.$('mat-card-title').getText();
            if (title.includes(cardTitle)) {
                return card;
            }
        }
        throw new Error(`Benefit card with title "${cardTitle}" not found`);
    }

    public async getButtonByText(buttonText: string) {
        // Check specific button types in your component
        const allButtons = await $$('shared-start-button button, button[mat-stroked-button]');
        for (const button of allButtons) {
            const text = await button.getText();
            if (text.includes(buttonText)) {
                return button;
            }
        }
        throw new Error(`Button with text "${buttonText}" not found`);
    }

    // Navigation
    public async open() {
        await super.open('');
        // WebdriverIO auto-waits for elements to be interactable when we use them
    }
}

export default new LandingPage();
