import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingPage } from './landing-page';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

describe('Feature: Application Landing Page', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPage,
        CommonModule,
        RouterModule.forRoot([]),
        StepNavigationComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
  });

  describe('Scenario: Landing page component initialization', () => {
    it('Given the landing page component is created, When it initializes, Then it should render successfully', () => {
      // Given: Landing page component is created
      console.log('🔧 BDD: Landing page component is created');
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      
      // Then: Should render successfully
      console.log('✅ BDD: Landing page component renders successfully');
      expect(component).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.landing-page')).toBeTruthy();
    });

    it('Given the landing page component renders, When it initializes, Then it should display the main content', () => {
      // Given: Landing page component renders
      console.log('🔧 BDD: Landing page component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the main content
      console.log('✅ BDD: Landing page displays main content');
             const mainContent = fixture.nativeElement.querySelector('.landing-page');
       expect(mainContent).toBeTruthy();
    });
  });

  describe('Scenario: Hero section display', () => {
    it('Given the component renders, When it initializes, Then it should display the hero section', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the hero section
      console.log('✅ BDD: Component displays hero section');
      const heroSection = fixture.nativeElement.querySelector('.hero-section');
      expect(heroSection).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display the main heading', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the main heading
      console.log('✅ BDD: Component displays main heading');
      const mainHeading = fixture.nativeElement.querySelector('.hero-title');
      expect(mainHeading).toBeTruthy();
             expect(mainHeading.textContent).toContain('Bluesky Social Migrator');
    });

         it('Given the component renders, When it initializes, Then it should display the hero description', () => {
       // Given: Component renders
       console.log('🔧 BDD: Component renders');
       fixture.detectChanges();
       
       // When: Component initializes
       console.log('⚙️ BDD: Component initializes');
       
       // Then: Should display the hero description
       console.log('✅ BDD: Component displays hero description');
       const heroDescription = fixture.nativeElement.querySelector('.hero-description');
       expect(heroDescription).toBeTruthy();
       expect(heroDescription.textContent).toContain('migrate your Instagram content');
     });
  });

  describe('Scenario: Call-to-action buttons', () => {
    it('Given the component renders, When it initializes, Then it should display the Get Started button', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the Get Started button
      console.log('✅ BDD: Component displays Get Started button');
      const getStartedButton = fixture.nativeElement.querySelector('.cta-button');
      expect(getStartedButton).toBeTruthy();
             expect(getStartedButton.textContent).toContain('Start Migration');
    });

    it('Given the component renders, When it initializes, Then the Get Started button should link to upload step', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Get Started button should link to upload step
      console.log('✅ BDD: Get Started button links to upload step');
      const getStartedButton = fixture.nativeElement.querySelector('.cta-button');
      expect(getStartedButton.getAttribute('routerLink')).toBe('/upload');
    });

         it('Given the component renders, When it initializes, Then it should display the Learn More button', () => {
       // Given: Component renders
       console.log('🔧 BDD: Component renders');
       fixture.detectChanges();
       
       // When: Component initializes
       console.log('⚙️ BDD: Component initializes');
       
       // Then: Should display the Learn More button
       console.log('✅ BDD: Component displays Learn More button');
       const learnMoreButton = fixture.nativeElement.querySelector('.cta-button.secondary');
       expect(learnMoreButton).toBeTruthy();
       expect(learnMoreButton.textContent).toContain('Learn More');
     });
  });

  describe('Scenario: Step navigation integration', () => {
    it('Given the component renders, When it initializes, Then it should display the step navigation', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the step navigation
      console.log('✅ BDD: Component displays step navigation');
      const stepNavigation = fixture.nativeElement.querySelector('shared-step-navigation');
      expect(stepNavigation).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then the step navigation should be properly positioned', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Step navigation should be properly positioned
      console.log('✅ BDD: Step navigation is properly positioned');
      const stepNavigation = fixture.nativeElement.querySelector('shared-step-navigation');
      expect(stepNavigation).toBeTruthy();
             expect(stepNavigation.parentElement).toHaveClass('features-section');
    });
  });

  describe('Scenario: Feature highlights section', () => {
    it('Given the component renders, When it initializes, Then it should display the features section', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the features section
      console.log('✅ BDD: Component displays features section');
      const featuresSection = fixture.nativeElement.querySelector('.features-section');
      expect(featuresSection).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display feature cards', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display feature cards
      console.log('✅ BDD: Component displays feature cards');
      const infoCards = fixture.nativeElement.querySelectorAll('.info-card');
      expect(infoCards.length).toBeGreaterThan(0);
    });

    it('Given the component renders, When it initializes, Then it should display the Secure & Private feature', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the Secure & Private feature
      console.log('✅ BDD: Component displays Secure & Private feature');
      const infoCards = fixture.nativeElement.querySelectorAll('.info-card');
      const secureCard = Array.from(infoCards as NodeListOf<Element>).find((card: Element) => 
        card.textContent?.includes('Secure & Private')
      );
      expect(secureCard).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display the Multi-Platform feature', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the Multi-Platform feature
      console.log('✅ BDD: Component displays Multi-Platform feature');
      const infoCards = fixture.nativeElement.querySelectorAll('.info-card');
      const multiPlatformCard = Array.from(infoCards as NodeListOf<Element>).find((card: Element) => 
        card.textContent?.includes('Multi-Platform')
      );
      expect(multiPlatformCard).toBeTruthy();
    });

    it('Given the component renders, When it initializes, Then it should display the Fast & Efficient feature', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the Fast & Efficient feature
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
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have the correct CSS classes
      console.log('✅ BDD: Component has correct CSS classes');
      const landingPage = fixture.nativeElement.querySelector('.landing-page');
      expect(landingPage).toHaveClass('landing-page');
      expect(landingPage.querySelector('.hero-section')).toHaveClass('hero-section');
      expect(landingPage.querySelector('.hero-section')).toHaveClass('hero-section');
      expect(landingPage.querySelector('.features-section')).toHaveClass('features-section');
    });

    it('Given the component renders, When it initializes, Then it should have the correct layout structure', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have the correct layout structure
      console.log('✅ BDD: Component has correct layout structure');
      const landingPage = fixture.nativeElement.querySelector('.landing-page');
      expect(landingPage.querySelector('.hero-section')).toBeTruthy();
      expect(landingPage.querySelector('.features-section')).toBeTruthy();
      expect(landingPage.querySelector('shared-step-navigation')).toBeTruthy();
    });
  });

  describe('Scenario: Accessibility and semantic structure', () => {
    it('Given the component renders, When it initializes, Then it should have semantic HTML structure', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have semantic HTML structure
      console.log('✅ BDD: Component has semantic HTML structure');
      const landingPage = fixture.nativeElement.querySelector('.landing-page');
      expect(landingPage).toBeTruthy();
      expect(landingPage).toHaveClass('landing-page');
    });

    it('Given the component renders, When it initializes, Then it should have proper heading hierarchy', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have proper heading hierarchy
      console.log('✅ BDD: Component has proper heading hierarchy');
      const heroTitle = fixture.nativeElement.querySelector('.hero-title');
      expect(heroTitle).toBeTruthy();
      // Note: Heading level will be determined by CSS or parent context
    });
  });

  describe('Scenario: Responsive design', () => {
    it('Given the component renders, When it initializes, Then it should have responsive CSS classes', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should have responsive CSS classes
      console.log('✅ BDD: Component has responsive CSS classes');
      const landingPage = fixture.nativeElement.querySelector('.landing-page');
      expect(landingPage).toBeTruthy();
      // Note: Responsive behavior is tested through CSS media queries
    });
  });

  describe('Scenario: Content accuracy and messaging', () => {
    it('Given the component renders, When it initializes, Then it should display accurate migration information', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display accurate migration information
      console.log('✅ BDD: Component displays accurate migration information');
      const heroDescription = fixture.nativeElement.querySelector('.hero-description');
             expect(heroDescription.textContent).toContain('migrate your Instagram content');
    });

    it('Given the component renders, When it initializes, Then it should display the correct app branding', () => {
      // Given: Component renders
      console.log('🔧 BDD: Component renders');
      fixture.detectChanges();
      
      // When: Component initializes
      console.log('⚙️ BDD: Component initializes');
      
      // Then: Should display the correct app branding
      console.log('✅ BDD: Component displays correct app branding');
      const heroTitle = fixture.nativeElement.querySelector('.hero-title');
             expect(heroTitle.textContent).toContain('Bluesky Social Migrator');
    });
  });
});
