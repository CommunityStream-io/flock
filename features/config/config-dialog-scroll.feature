Feature: Configuration Dialog Scroll Detection - Prevent Layout Issues

  As a developer testing dialog behavior
  I want to detect scroll issues in help dialogs
  So that I can prevent layout problems in the application

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @config @dialog @scroll-detection @edge-case
  Scenario: Help dialog should not have scroll issues
    When I click the date range help button
    Then the help dialog should open
    And the help dialog should not have scroll bars
    And the help dialog content should fit within the viewport
    And the help dialog should not cause page scroll
    And the help dialog footer should be visible without scrolling

  @config @dialog @scroll-detection @edge-case
  Scenario: Help dialog should handle long content gracefully
    When I click the testing options help button
    Then the help dialog should open
    And the help dialog should not have scroll bars
    And the help dialog content should be properly constrained
    And the help dialog should maintain proper spacing
    And the help dialog should not overflow the viewport

  @config @dialog @scroll-detection @edge-case
  Scenario: Help dialog should work on different screen sizes
    When I resize the browser to mobile size
    And I click the date range help button
    Then the help dialog should open
    And the help dialog should not have scroll bars
    And the help dialog should fit within the mobile viewport
    And the help dialog should be fully accessible

    When I resize the browser to tablet size
    And I click the testing options help button
    Then the help dialog should open
    And the help dialog should not have scroll bars
    And the help dialog should fit within the tablet viewport
    And the help dialog should be fully accessible

  @config @dialog @scroll-detection @edge-case
  Scenario: Help dialog should prevent body scroll when open
    When I click the date range help button
    Then the help dialog should open
    And the body should not be scrollable
    And the page content should not move
    And the help dialog should be the only scrollable element

  @config @dialog @scroll-detection @edge-case
  Scenario: Help dialog should restore scroll when closed
    When I click the date range help button
    And the help dialog opens
    And I close the help dialog
    Then the body should be scrollable again
    And the page should return to its original state
    And no scroll issues should remain

  @config @dialog @scroll-detection @edge-case
  Scenario: Multiple help dialogs should not accumulate scroll issues
    When I click the date range help button
    And I close the help dialog
    And I click the testing options help button
    And I close the help dialog
    Then the page should not have any scroll issues
    And the body should be scrollable
    And no layout problems should persist

  @config @dialog @scroll-detection @edge-case
  Scenario: Help dialog should handle keyboard navigation without scroll issues
    When I click the date range help button
    And I use Tab to navigate through the dialog
    Then the help dialog should not have scroll bars
    And the focused element should be visible
    And the dialog should not scroll unexpectedly
    And the dialog should maintain proper focus management

  @config @dialog @scroll-detection @edge-case
  Scenario: Help dialog should handle window resize without scroll issues
    When I click the date range help button
    And I resize the browser window
    Then the help dialog should not have scroll bars
    And the help dialog should adapt to the new size
    And the help dialog should remain fully accessible
    And no scroll issues should be introduced
