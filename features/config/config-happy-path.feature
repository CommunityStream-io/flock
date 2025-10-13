Feature: Configuration Happy Path - Quick and Easy Setup

  As a user configuring my migration
  I want to quickly configure basic settings
  So that I can proceed to migration with minimal effort

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @config @smoke @core @parallel
  Scenario: Default configuration allows immediate progression
    Then the configuration form should be valid
    And I should not see any validation errors
    When I click the "Next" button
    Then the configuration should be saved
    And I should be navigated to the migrate step

  @config @smoke @core @parallel
  Scenario: Enable test mode and proceed
    When I enable test video mode
    Then the configuration form should be valid
    When I click the "Next" button
    Then the configuration should be saved
    And the test video mode setting should be stored
    And I should be navigated to the migrate step

  @config @smoke @core @parallel
  Scenario: Enable simulation mode and proceed
    When I enable simulation mode
    Then the configuration form should be valid
    When I click the "Next" button
    Then the configuration should be saved
    And the simulation mode setting should be stored
    And I should be navigated to the migrate step

  @config @smoke @core @parallel
  Scenario: Configure simple date range and proceed
    When I enter a valid start date "2023-01-01"
    And I enter a valid end date "2023-12-31"
    Then the configuration form should be valid
    And I should not see any validation errors
    When I click the "Next" button
    Then the configuration should be saved
    And the start date setting should be stored
    And the end date setting should be stored
    And I should be navigated to the migrate step

  @config @smoke @core @parallel
  Scenario: Configure all settings and proceed
    When I enable test video mode
    And I enable simulation mode
    And I enter a valid start date "2023-01-01"
    And I enter a valid end date "2023-12-31"
    Then the configuration form should be valid
    And I should not see any validation errors
    When I click the "Next" button
    Then the configuration should be saved
    And all configuration settings should be stored correctly
    And I should be navigated to the migrate step

