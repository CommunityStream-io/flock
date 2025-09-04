Feature: Password Validation - Bluesky Password Requirements

  As a user entering my Bluesky password
  I want the system to validate password requirements
  So that I can provide valid credentials for authentication

  Background:
    Given the application is running
    And the splash screen message should be "*flap* *flap* *flap*"
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step

  @bluesky-auth @validation
  Scenario: Password validation requires non-empty value
    When I leave the password field empty
    Then the password field should show an error
    And the error should indicate "Password is required"
    And the form should remain invalid

    When I enter a password
    Then the password field should not show any errors
    And the password validation should pass
