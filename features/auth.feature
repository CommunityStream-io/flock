Feature: Bluesky Authentication - User credential validation and authentication

  As a user migrating from Instagram to Bluesky
  I want to authenticate with my Bluesky credentials
  So that I can proceed with the migration process

  Background:
    Given the application is running
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step

  @bluesky-auth @validation
  Scenario: Authentication form displays correctly
    Then I should see the Bluesky authentication form
    And I should see a username input field with @ prefix
    And I should see a password input field
    And the form should be initially invalid

  @bluesky-auth @validation
  Scenario: Username validation enforces proper format
    When I enter a username with @ symbol
    Then the username field should show an error
    And the error should indicate "Do not include the @ symbol - it is automatically added"
    And the form should remain invalid

    When I enter a username without dots
    Then the username field should show an error
    And the error should indicate "Username must contain at least two dots (e.g., username.bksy.social)"
    And the form should remain invalid

    When I enter a username with one dot
    Then the username field should show an error
    And the error should indicate "Username must contain at least two dots (e.g., username.bksy.social)"
    And the form should remain invalid

    When I enter a valid username "username.bksy.social"
    Then the username field should not show any errors
    And the username validation should pass

    When I enter a valid custom domain username "user.custom.domain"
    Then the username field should not show any errors
    And the username validation should pass

  @bluesky-auth @validation
  Scenario: Password validation requires non-empty value
    When I leave the password field empty
    Then the password field should show an error
    And the error should indicate "Password is required"
    And the form should remain invalid

    When I enter a password
    Then the password field should not show any errors
    And the password validation should pass

  @bluesky-auth @validation
  Scenario: Form validation requires both fields to be valid
    Given I have entered a valid username
    When I enter a valid password
    Then the form should be valid
    And the "Next" button should be enabled

    Given I have entered a valid password
    When I enter a valid username
    Then the form should be valid
    And the "Next" button should be enabled

  @bluesky-auth @validation
  Scenario: Successful authentication allows progression
    And I have entered valid credentials
    When I click the "Next" button
    Then the authentication script should run in the background
    And I should be navigated to the config step

  @bluesky-auth @validation
  Scenario: Failed authentication shows appropriate error
    And I have entered invalid credentials
    When I click the "Next" button
    Then the authentication should fail
    And I should see a snackbar error message
    And the error should indicate "Invalid Bluesky credentials"
    And I should remain on the auth step
    And the form should remain invalid

  @bluesky-auth @validation
  Scenario: Navigation guard prevents progression without valid credentials
    And I am on the auth step without valid credentials
    When I attempt to navigate to the config step
    Then the navigation should be blocked
    And I should see a snackbar error message
    And the error should indicate "Please provide valid Bluesky credentials"
    And I should remain on the auth step

    Given I have successfully authenticated
    When I attempt to navigate to the config step
    Then the navigation should succeed
    And I should be on the config step page

  @bluesky-auth @validation
  Scenario: Deactivate validation ensures credentials are saved
    And I have entered valid credentials
    When I attempt to navigate away from the auth step
    Then the system should validate my credentials
    And if valid, I should proceed to the next step
    And if invalid, I should see a snackbar error message
    And the error should indicate "Please complete authentication before proceeding"

  @bluesky-auth @help @dialog
  Scenario: Help dialog provides username format guidance
    When I click the help icon
    Then I should see a help dialog with username format suggestions
    And the dialog should contain "username.bksy.social"
    And the dialog should contain "user.custom.domain"
    And the dialog should explain that the @ symbol is automatically added
    When I close the help dialog
    Then the help dialog should be hidden

  @bluesky-auth @help @dialog @escape
  Scenario: Help dialog can be closed with Escape key
    When I click the help icon
    Then I should see a help dialog with username format suggestions
    When I close the help dialog with Escape key
    Then the help dialog should be hidden
