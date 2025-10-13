Feature: Authentication Help Dialog - Username Format Guidance

  As a user needing help with username format
  I want to access helpful guidance
  So that I can enter my credentials correctly

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step

  @auth @help @ui @parallel
  Scenario: Help dialog provides username format guidance
    When I click the help icon
    Then I should see a help dialog with username format suggestions
    And the dialog should contain "username.bksy.social"
    And the dialog should contain "user.custom.domain"
    And the dialog should explain that the @ symbol is automatically added
    When I close the help dialog
    Then the help dialog should be hidden

  @auth @help @ui @accessibility @parallel
  Scenario: Help dialog can be closed with Escape key
    When I click the help icon
    Then I should see a help dialog with username format suggestions
    When I close the help dialog with Escape key
    Then the help dialog should be hidden
