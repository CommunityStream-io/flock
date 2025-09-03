Feature: Migration Steps Workflow - Step-by-step migration process

  As a user migrating from Instagram to Bluesky
  I want to navigate through the migration steps smoothly
  So that I can complete my migration process step by step

  Background:
    Given the application is running

  @migration-steps @step-navigation
  Scenario: Step layout displays correct navigation structure
    Given I navigate to the upload step
    Then I should see the step layout container
    And I should see the step navigation footer
    And the current step should be highlighted as "upload"

  @migration-steps @step-workflow @skip
  Scenario: Complete migration workflow navigation
    Given I navigate to the upload step
    When I upload a valid Instagram archive
    And I navigate to the auth step
    Then I should be on the auth step page
    And I should see the Bluesky authentication form
    When I navigate to the config step
    Then I should be on the config step page
    And I should see migration configuration options
    When I navigate to the migrate step
    Then I should be on the migrate step page
    And I should see the migration progress interface
    When I navigate to the complete step
    Then I should be on the complete step page
    And I should see the migration completion confirmation

  @migration-steps @step-titles @skip
  Scenario: Each step displays correct title and description
    Given I navigate to the upload step
    Then the page title should be "Upload Data"
    And I should see the description "Upload instagram archive"
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    Then the page title should be "Authenticate with Bluesky"
    And I should see the description "Authenticate with Bluesky to migrate"
    When I navigate to the config step
    Then the page title should be "Configuration"
    And I should see the description "Configure migration settings"

  @migration-steps @bluesky-auth @validation
  Scenario: Authentication form displays correctly
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    Then I should see the Bluesky authentication form
    And I should see a username input field with @ prefix
    And I should see a password input field
    And the form should be initially invalid

  @migration-steps @bluesky-auth @validation
  Scenario: Username validation enforces proper format
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    When I enter a username without @ prefix
    Then the username field should show an error
    And the error should indicate "@ prefix is required"
    And the form should remain invalid

    When I enter a username with @ prefix but no dots
    Then the username field should show an error
    And the error should indicate "Username must contain at least two dots"
    And the form should remain invalid

    When I enter a username with @ prefix and one dot
    Then the username field should show an error
    And the error should indicate "Username must contain at least two dots"
    And the form should remain invalid

    When I enter a valid username "@username.bksy.social"
    Then the username field should not show any errors
    And the username validation should pass

    When I enter a valid custom domain username "@user.custom.domain"
    Then the username field should not show any errors
    And the username validation should pass

  @migration-steps @bluesky-auth @validation
  Scenario: Password validation requires non-empty value
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    When I leave the password field empty
    Then the password field should show an error
    And the error should indicate "Password is required"
    And the form should remain invalid

    When I enter a password
    Then the password field should not show any errors
    And the password validation should pass

  @migration-steps @bluesky-auth @validation
  Scenario: Form validation requires both fields to be valid
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    Given I have entered a valid username
    When I enter a valid password
    Then the form should be valid
    And the "Next" button should be enabled

    Given I have entered a valid password
    When I enter a valid username
    Then the form should be valid
    And the "Next" button should be enabled

  @migration-steps @bluesky-auth @validation
  Scenario: Successful authentication allows progression
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    When I click the "Next" button
    Then the authentication script should run in the background
    And I should be navigated to the config step

  @migration-steps @bluesky-auth @validation
  Scenario: Failed authentication shows appropriate error
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered invalid credentials
    When I click the "Next" button
    Then the authentication should fail
    And I should see a snackbar error message
    And the error should indicate "Invalid Bluesky credentials"
    And I should remain on the auth step
    And the form should remain invalid

  @migration-steps @bluesky-auth @validation
  Scenario: Navigation guard prevents progression without valid credentials
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
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

  @migration-steps @bluesky-auth @validation
  Scenario: Deactivate validation ensures credentials are saved
    Given I navigate to the upload step
    When I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    When I attempt to navigate away from the auth step
    Then the system should validate my credentials
    And if valid, I should proceed to the next step
    And if invalid, I should see a snackbar error message
    And the error should indicate "Please complete authentication before proceeding"
