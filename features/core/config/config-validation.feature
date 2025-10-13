@core @config @validation
Feature: Configuration Validation - Settings Verification

  As a user with invalid configuration
  I want to see clear validation errors
  So that I can fix my settings before proceeding

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @form-state @smoke
  Scenario: Configuration form is initially valid
    Then the configuration form should be valid
    And I should not see any validation errors
    And the "Next" button should be enabled
    And I should see validation success indicators

  @form-state
  Scenario: Configuration form remains valid with default settings
    Given I have not changed any configuration settings
    When I attempt to navigate to the next step
    Then the configuration form should be valid
    And I should not see any validation errors
    And the navigation should be allowed

  @form-state
  Scenario: Configuration form remains valid with valid changes
    When I enable test video mode
    And I enable simulation mode
    And I enter a valid start date "2023-01-01"
    And I enter a valid end date "2023-12-31"
    Then the configuration form should be valid
    And I should not see any validation errors
    And the "Next" button should be enabled

  @error-handling
  Scenario: Date validation errors are displayed clearly
    When I enter an invalid start date "invalid-date"
    Then the start date field should show an error
    And the error should be clearly visible
    And the error should indicate the correct format
    And the form should remain valid

    When I enter an invalid end date "invalid-date"
    Then the end date field should show an error
    And the error should be clearly visible
    And the error should indicate the correct format
    And the form should remain valid



