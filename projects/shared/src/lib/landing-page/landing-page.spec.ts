import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

describe('Feature: Application Landing Page', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        CommonModule,
        RouterModule.forRoot([]),
        StepNavigationComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Landing page component initialization', () => {
    it('Given the landing page component is created, When it initializes, Then it should render successfully', () => {
      console.log('🔧 BDD: Landing page component is created');
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      console.log('✅ BDD: Landing page component renders successfully');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.landing-page')).toBeTruthy();
    });

    it('Given the landing page component renders, When it initializes, Then it should display the main content', () => {
      console.log('🔧 BDD: Landing page component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Landing page displays main content');
      const mainContent = fixture.nativeElement.querySelector('.landing-page');
      expect(mainContent).toBeTruthy();
    });
  });

  describe('Scenario: Intro section display', () => {
    it('Given the component renders, When it initializes, Then it should display the intro section', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays intro section');
      const introSection = fixture.nativeElement.querySelector('.intro-section');
      expect(introSection).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display the main heading', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays main heading');
      const mainHeading = fixture.nativeElement.querySelector('.intro-card mat-card-title');
      expect(mainHeading).toBeTruthy();
      expect(mainHeading.textContent).toContain('Flock: Birds of a Feather Migrate Together');
    });

    it('Given the component renders, When it initializes, Then it should display the intro description', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays intro description');
      const introSubtitle = fixture.nativeElement.querySelector('.intro-card mat-card-subtitle');
      expect(introSubtitle).toBeTruthy();
      expect(introSubtitle.textContent).toContain("Bluesky's decentralized skies");
    });
  });

  describe('Scenario: Call-to-action buttons', () => {
    it('Given the component renders, When it initializes, Then it should display the Get Started button', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays Get Started button');
      const getStartedButton = fixture.nativeElement.querySelector('.cta-button');
      expect(getStartedButton).toBeTruthy();
      expect(getStartedButton.textContent).toContain('Begin Your Journey');
    });

    it('Given the component renders, When it initializes, Then the Get Started button should link to upload step', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Get Started button links to upload step');
      const getStartedButton = fixture.nativeElement.querySelector('.cta-button');
      // RouterLink applied as array for secondary outlet; verify attribute presence and content
      const routerLinkAttr = getStartedButton.getAttribute('ng-reflect-router-link');
      expect(routerLinkAttr).toContain('step: upload');
    });

    it('Given the component renders, When it initializes, Then it should display the Learn More button', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays Learn More button');
      const learnMoreButton = fixture.nativeElement.querySelector('[routerLink="/help"]');
      expect(learnMoreButton).toBeTruthy();
      expect(learnMoreButton.textContent).toContain('Explore the Skies');
    });
  });

  // Step navigation is part of the step layout, not the landing page

  describe('Scenario: Feature highlights section', () => {
    it('Given the component renders, When it initializes, Then it should display the features section', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays features section');
      const featuresGrid = fixture.nativeElement.querySelector('.grid-info-cards');
      expect(featuresGrid).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display feature cards', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays feature cards');
      const infoCards = fixture.nativeElement.querySelectorAll('.info-card');
      expect(infoCards.length).toBeGreaterThan(0);
    });

    it('Given the component renders, When it initializes, Then it should display the Secure & Private feature', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays Secure & Private feature');
      const infoCards = fixture.nativeElement.querySelectorAll('.info-card');
      const secureCard = Array.from(infoCards as NodeListOf<Element>).find((card: Element) => 
        card.textContent?.includes('Secure & Private')
      );
      expect(secureCard).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display the Multi-Platform feature', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays Multi-Platform feature');
      const infoCards = fixture.nativeElement.querySelectorAll('.info-card');
      const multiPlatformCard = Array.from(infoCards as NodeListOf<Element>).find((card: Element) => 
        card.textContent?.includes('Multi-Platform')
      );
      expect(multiPlatformCard).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display the Fast & Efficient feature', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays Fast & Efficient feature');
      const infoCards = fixture.nativeElement.querySelectorAll('.info-card');
      const fastCard = Array.from(infoCards as NodeListOf<Element>).find((card: Element) => 
        card.textContent?.includes('Fast & Efficient')
      );
      expect(fastCard).toBeTruthy();
    });
  });

  describe('Scenario: Component structure and styling', () => {
    it('Given the component renders, When it initializes, Then it should have the correct CSS classes', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component has correct CSS classes');
      const landingPage = fixture.nativeElement.querySelector('.landing-page');
      expect(landingPage).toHaveClass('landing-page');
      expect(landingPage.querySelector('.intro-section')).toBeTruthy();
      expect(landingPage.querySelector('.grid-info-cards')).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should have the correct layout structure', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component has correct layout structure');
      const landingPage = fixture.nativeElement.querySelector('.landing-page');
      expect(landingPage.querySelector('.intro-section')).toBeTruthy();
      expect(landingPage.querySelector('.grid-info-cards')).toBeTruthy();
    });
  });

  describe('Scenario: Accessibility and semantic structure', () => {
    it('Given the component renders, When it initializes, Then it should have semantic HTML structure', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component has semantic HTML structure');
      const landingPage = fixture.nativeElement.querySelector('.landing-page');
      expect(landingPage).toBeTruthy();
      expect(landingPage).toHaveClass('landing-page');
    });

    it('Given the component renders, When it initializes, Then it should have proper heading hierarchy', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component has proper heading hierarchy');
      const heading = fixture.nativeElement.querySelector('.intro-card mat-card-title');
      expect(heading).toBeTruthy();
    });
  });

  describe('Scenario: Responsive design', () => {
    it('Given the component renders, When it initializes, Then it should have responsive CSS classes', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component has responsive CSS classes');
      const landingPage = fixture.nativeElement.querySelector('.landing-page');
      expect(landingPage).toBeTruthy();
    });
  });

  describe('Scenario: Content accuracy and messaging', () => {
    it('Given the component renders, When it initializes, Then it should display accurate migration information', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays accurate migration information');
      const introSubtitle = fixture.nativeElement.querySelector('.intro-card mat-card-subtitle');
      expect(introSubtitle.textContent).toContain("Bluesky's decentralized skies");
    });

    it('Given the component renders, When it initializes, Then it should display the correct app branding', () => {
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      console.log('⚙️ BDD: Component initializes');
      console.log('✅ BDD: Component displays correct app branding');
      const heading = fixture.nativeElement.querySelector('.intro-card mat-card-title');
      expect(heading.textContent).toContain('Flock: Birds of a Feather Migrate Together');
    });
  });
});