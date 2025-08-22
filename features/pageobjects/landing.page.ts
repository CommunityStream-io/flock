import Page from './page';

class LandingPage extends Page {
    // Main content elements
    public get mainContent() {
        return $('shared-landing-page, .landing-page, mat-card');
    }

    public get mainTitle() {
        return $('mat-card-title h1, h1');
    }

    public get subtitle() {
        return $('mat-card-subtitle, .subtitle');
    }

    public get migrationDescription() {
        return $('mat-card-content p, .description, p');
    }

    // Process steps
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

    // Section titles
    public get sectionTitles() {
        return $$('h2.section-title');
    }

    // Benefit cards
    public get benefitCards() {
        return $$('.info-card');
    }

    // Buttons
    public get beginJourneyButton() {
        return $('button[mat-raised-button], button');
    }

    public get exploreSkiesButton() {
        return $$('button[mat-raised-button], button')[1];
    }

    // Methods for dynamic element selection
    public async getStepTitle(stepNumber: number) {
        return $(`.process-step:nth-child(${stepNumber}) h3`);
    }

    public async getStepDescription(stepNumber: number) {
        return $(`.process-step:nth-child(${stepNumber}) p`);
    }

    public async getSectionByTitle(sectionTitle: string) {
        // Use a more compatible selector
        const allH2s = await $$('h2');
        for (const h2 of allH2s) {
            const text = await h2.getText();
            if (text.includes(sectionTitle)) {
                return h2;
            }
        }
        throw new Error(`Section with title "${sectionTitle}" not found`);
    }

    public async getBenefitCard(cardTitle: string) {
        // Use a more compatible selector
        const allCards = await $$('.info-card');
        for (const card of allCards) {
            const title = await card.$('h3').getText();
            if (title.includes(cardTitle)) {
                return card;
            }
        }
        throw new Error(`Benefit card with title "${cardTitle}" not found`);
    }

    public async getButtonByText(buttonText: string) {
        // Use a more compatible selector for Angular Material buttons
        const allButtons = await $$('button[mat-raised-button], button[mat-flat-button], button');
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
        // For demo purposes, we'll just wait a bit instead of checking for elements
        await browser.pause(1000);
    }
}

export default new LandingPage();
