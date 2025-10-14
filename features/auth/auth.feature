Feature: Bluesky Authentication - User credential validation and authentication

  As a user migrating from Instagram to Bluesky
  I want to authenticate with my Bluesky credentials
  So that I can proceed with the migration process

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step

  @auth @core @validation @parallel
  Scenario: Authentication form displays correctly
    Then I should see the Bluesky authentication form
    And I should see a username input field with @ prefix
    And I should see a password input field
    And the form should be initially invalid

  @auth @core @validation @parallel
  Scenario: Form validation requires both fields to be valid
    Given I have entered a valid username
    When I enter a valid password
    Then the form should be valid
    And the "Next" button should be enabled

    Given I have entered a valid password
    When I enter a valid username
    Then the form should be valid
    And the "Next" button should be enabled

  @auth @core @smoke @parallel
  Scenario: Successful authentication allows progression
    And I have entered valid credentials
    When I click the "Next" button
    Then the authentication script should run in the background
    And I should be navigated to the config step

  @auth @core @validation @parallel
  Scenario: Failed authentication shows appropriate error
    And I have entered invalid credentials
    When I click the "Next" button
    Then the authentication should fail
    And I should see a snackbar error message
    And the error should indicate "Invalid Bluesky credentials"
    And I should remain on the auth step
    And the form should remain invalid

  @auth @core @validation @parallel
  Scenario: Valid credentials allow navigation to next step
    And I have entered valid credentials
    When I attempt to navigate away from the auth step
    Then the system should validate my credentials
    And I should proceed to the next step

  @auth @core @parallel
  Scenario: Valid credentials trigger authentication splash screen
    Given I have entered a valid username
    And I have entered a valid password
    When I click the "Next" button
    Then I should see the splash screen
    And the splash screen should display "Authenticating with bsky.social"
    And the authentication should process in the background
    And I should be navigated to the config step
