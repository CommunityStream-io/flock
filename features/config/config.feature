Feature: Migration Configuration - User-Friendly Settings

  As a user configuring my migration
  I want to set migration options through a user-friendly interface
  So that my migration runs with the correct parameters

  Background:
    Given the application is running
    And the splash screen message should be "*flap* *flap* *flap*"
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @config @migration-settings
  Scenario: Configuration form displays correctly
    Then I should see the migration configuration form
    And I should see a date range section
    And I should see a testing options section
    And I should see a simulation mode toggle
    And the form should be initially valid

  @config @migration-settings
  Scenario: Default configuration values are set correctly
    Then the start date should be empty
    And the end date should be empty
    And the test video mode should be disabled
    And the simulation mode should be disabled
    And the form should be initially valid

  @config @migration-settings
  Scenario: Configuration settings can be modified
    When I enable test video mode
    Then the test video mode should be enabled
    And the form should be valid

    When I enable simulation mode
    Then the simulation mode should be enabled
    And the form should be valid

    When I disable test video mode
    Then the test video mode should be disabled
    And the form should be valid

  @config @migration-settings
  Scenario: Configuration changes are saved to service
    When I enable test video mode
    And I enable simulation mode
    Then the configuration service should be updated
    And the test video mode setting should be stored
    And the simulation mode setting should be stored

  @config @navigation
  Scenario: Valid configuration allows progression to next step
    Given I have configured valid settings
    When I click the "Next" button
    Then the configuration should be saved
    And I should be navigated to the migrate step

  @config @navigation
  Scenario: Configuration persists when navigating back
    Given I have configured test video mode
    And I have configured simulation mode
    When I navigate back to the auth step
    And I navigate forward to the config step
    Then the test video mode should still be enabled
    And the simulation mode should still be enabled

  @config @validation
  Scenario: Configuration validation shows appropriate feedback
    Given I have made configuration changes
    When I navigate away from the config step
    Then the configuration should be validated
    And I should see validation success indicators

  @config @help @dialog
  Scenario: Help dialog provides configuration guidance
    When I click the help icon for configuration
    Then I should see a help dialog with configuration guidance
    And the dialog should explain test video mode
    And the dialog should explain simulation mode
    And the dialog should explain date range filtering
    When I close the help dialog
    Then the help dialog should be hidden

  @config @help @dialog @escape
  Scenario: Help dialog can be closed with Escape key
    When I click the help icon for configuration
    Then I should see a help dialog with configuration guidance
    When I close the help dialog with Escape key
    Then the help dialog should be hidden

  @config @navigation @config-guard
  Scenario: Navigation to previous step is always allowed
    Given I am on the config step page
    When I attempt to navigate to the auth step
    Then the navigation should be allowed
    And I should be on the auth step
    And no configuration validation should be triggered

  @config @navigation @config-guard
  Scenario: Navigation to next step requires valid configuration
    Given I am on the config step page
    And I have not configured any settings
    When I attempt to navigate to the migrate step
    Then the navigation should be allowed
    And I should be on the migrate step
    And the default configuration should be used

  @config @navigation @config-guard
  Scenario: Direct URL navigation loads configuration form
    Given I am on the config step page
    When I attempt to navigate to a different URL directly
    Then the navigation should be allowed
    And I should be on the config step page
    And the configuration form should be loaded
