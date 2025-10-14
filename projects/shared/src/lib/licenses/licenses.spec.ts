import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Licenses } from './licenses';
import { RouterTestingModule } from '@angular/router/testing';

describe('Licenses', () => {
  let component: Licenses;
  let fixture: ComponentFixture<Licenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Licenses, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Licenses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should render page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-card-title')?.textContent).toContain('Licenses & Attributions');
  });

  it('should render butterfly animation attribution', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Butterfly Animation');
    expect(compiled.textContent).toContain('dazulu');
  });

  it('should render Marco Maroni attribution', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Marco Maroni');
    expect(compiled.textContent).toContain('instagram-to-bluesky');
  });

  xit('should render project license section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Project License');
    expect(compiled.textContent).toContain('MIT License');
  });

  xit('should render developer support section with Ko-fi iframe', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Support the Developer');
    const iframe = compiled.querySelector('iframe#kofiframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('src')).toContain('ko-fi.com/straiforce');
  });

  it('should have working links to external resources', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a[href]');
    
    // Should have links to CodePen, Bluesky, Ko-fi, etc.
    expect(links.length).toBeGreaterThan(0);
    
    // Verify some key links
    const linkUrls = Array.from(links).map(link => link.getAttribute('href'));
    expect(linkUrls).toContain('https://codepen.io/dazulu/pen/aOzqvz');
    expect(linkUrls).toContain('https://bsky.app/profile/did:plc:76lzczubpyga4qfno7mr5vkq');
    expect(linkUrls).toContain('https://tangled.org/@marcomaroni.it/instagram-to-bluesky');
  });

  it('should have a back to home button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector('button[routerLink="/"]');
    expect(backButton).toBeTruthy();
    expect(backButton?.textContent).toContain('Back to Home');
  });
});

