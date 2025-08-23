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

  @migration-steps @step-workflow 
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

  @migration-steps @step-titles 
  Scenario: Each step displays correct title and description
    Given I navigate to the upload step
    Then the page title should be "Upload Data"
    And I should see the description "Upload instagram archive"
    When I navigate to the auth step with valid archive
    Then the page title should be "Authenticate with Bluesky"
    And I should see the description "Authenticate with Bluesky to migrate"
    When I navigate to the config step
    Then the page title should be "Configuration"
    And I should see the description "Configure migration settings"