Feature: Username Validation - Bluesky Username Format Enforcement

  As a user entering my Bluesky username
  I want the system to validate the correct format
  So that I can provide valid credentials for authentication

  Background:
    Given the application is running
    And the splash screen message should be "*flap* *flap* *flap*"
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step

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
