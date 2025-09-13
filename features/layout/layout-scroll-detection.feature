Feature: Layout Scroll Detection - Prevent Viewport Issues

  As a developer testing layout behavior
  I want to detect scroll issues in step transitions
  So that I can prevent layout problems and ensure fixed viewport across all devices

  Background:

  @layout @scroll-detection @viewport @mobile
  Scenario: Step layout should not have scroll issues on mobile devices
    When I navigate to the upload step
    Then the step layout should not have scroll bars
    And the step content should fit within the mobile viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

    When I navigate to the auth step
    Then the step layout should not have scroll bars
    And the step content should fit within the mobile viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

    When I navigate to the config step
    Then the step layout should not have scroll bars
    And the step content should fit within the mobile viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

  @layout @scroll-detection @viewport @tablet
  Scenario: Step layout should not have scroll issues on tablet devices
    When I resize the browser to tablet size
    And I navigate to the upload step
    Then the step layout should not have scroll bars
    And the step content should fit within the tablet viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

    When I navigate to the auth step
    Then the step layout should not have scroll bars
    And the step content should fit within the tablet viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

    When I navigate to the config step
    Then the step layout should not have scroll bars
    And the step content should fit within the tablet viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

  @layout @scroll-detection @viewport @desktop
  Scenario: Step layout should not have scroll issues on desktop devices
    When I resize the browser to desktop size
    And I navigate to the upload step
    Then the step layout should not have scroll bars
    And the step content should fit within the desktop viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

    When I navigate to the auth step
    Then the step layout should not have scroll bars
    And the step content should fit within the desktop viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

    When I navigate to the config step
    Then the step layout should not have scroll bars
    And the step content should fit within the desktop viewport
    And the step layout should not cause page scroll
    And the step navigation footer should be visible without scrolling

  @layout @scroll-detection @splash-screen @transitions
  Scenario: Splash screen should prevent step scrolling during transitions
    When I navigate to the upload step
    And the splash screen appears during navigation
    And the splash screen is visible
    Then the step content should be hidden during splash screen
    And the body should not be scrollable during splash screen
    And the page content should not move during splash screen
    And the splash screen should be the only visible element
    And the step layout should not have scroll bars
    And the step content should not overflow the viewport

    When the splash screen disappears
    Then the step content should be visible again
    And the body should be scrollable again
    And the page should return to its original state
    And no scroll issues should remain

  @layout @scroll-detection @splash-screen @transitions
  Scenario: Multiple step transitions should not accumulate scroll issues
    When I navigate to the upload step
    And the splash screen appears and disappears
    And I navigate to the auth step
    And the splash screen appears and disappears
    And I navigate to the config step
    And the splash screen appears and disappears
    And the splash screen is not visible
    Then the page should not have any scroll issues
    And the body should be scrollable
    And no layout problems should persist
    And the step layout should maintain proper viewport constraints

  @layout @scroll-detection @splash-screen @transitions
  Scenario: Step layout should handle window resize without scroll issues
    When I navigate to the config step
    And I resize the browser window to mobile size
    Then the step layout should not have scroll bars
    And the step layout should adapt to the new size
    And the step layout should remain fully accessible
    And no scroll issues should be introduced

    When I resize the browser window to tablet size
    Then the step layout should not have scroll bars
    And the step layout should adapt to the new size
    And the step layout should remain fully accessible
    And no scroll issues should be introduced

    When I resize the browser window to desktop size
    Then the step layout should not have scroll bars
    And the step layout should adapt to the new size
    And the step layout should remain fully accessible
    And no scroll issues should be introduced

  @layout @scroll-detection @viewport @responsive
  Scenario: Step layout should maintain fixed viewport across all screen sizes
    When I resize the browser to mobile size
    And I navigate to any step
    Then the step layout should have a fixed viewport height
    And the step content should not overflow the viewport
    And the step navigation should remain accessible
    And no vertical scrolling should be possible

    When I resize the browser to tablet size
    And I navigate to any step
    Then the step layout should have a fixed viewport height
    And the step content should not overflow the viewport
    And the step navigation should remain accessible
    And no vertical scrolling should be possible

    When I resize the browser to desktop size
    And I navigate to any step
    Then the step layout should have a fixed viewport height
    And the step content should not overflow the viewport
    And the step navigation should remain accessible
    And no vertical scrolling should be possible

  @layout @scroll-detection @splash-screen @accessibility
  Scenario: Step layout should maintain accessibility during splash screen transitions
    When I navigate to the upload step
    And the splash screen appears during navigation
    And the splash screen is visible
    Then the step content should be hidden from screen readers
    And the splash screen should be announced to screen readers
    And focus should be managed properly during transition
    And keyboard navigation should be disabled during splash screen
    And the step layout should not have scroll bars
    And the step content should not overflow the viewport

    When the splash screen disappears
    And the splash screen is not visible
    Then the step content should be accessible to screen readers again
    And focus should be restored to appropriate element
    And keyboard navigation should be re-enabled
    And no accessibility issues should remain

  @layout @scroll-detection @viewport @edge-case
  Scenario: Step layout should handle rapid navigation without scroll issues
    When I rapidly navigate between steps
    And multiple splash screens appear and disappear
    Then the page should not have any scroll issues
    And the body should remain scrollable
    And no layout problems should persist
    And the step layout should maintain proper viewport constraints
    And all step transitions should complete successfully
