@core @config @date-range
Feature: Date Range Filtering - Instagram Post Date Selection

  As a user migrating from Instagram
  I want to specify date ranges for my posts
  So that I can migrate only posts from specific time periods

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @validation @smoke
  Scenario: Date range section displays correctly
    Then I should see the date range section
    And I should see a start date input field
    And I should see an end date input field
    And I should see a clear dates button
    And both date fields should be initially empty

  @validation
  Scenario: Start date validation enforces proper format
    When I enter an invalid start date "invalid-date"
    Then the start date field should show an error
    And the error should indicate "Please enter a valid date"
    And the form should remain valid

    When I enter a valid start date "2023-01-01"
    Then the start date field should not show any errors
    And the start date validation should pass

  @validation
  Scenario: End date validation enforces proper format
    When I enter an invalid end date "invalid-date"
    Then the end date field should show an error
    And the error should indicate "Please enter a valid date"
    And the form should remain valid

    When I enter a valid end date "2023-12-31"
    Then the end date field should not show any errors
    And the end date validation should pass

  @validation @critical
  Scenario: Date range validation enforces logical order
    When I enter a start date "2023-12-31"
    And I enter an end date "2023-01-01"
    Then the end date field should show an error
    And the error should indicate "End date must be after start date"
    And the form should remain valid

    When I enter a start date "2023-01-01"
    And I enter an end date "2023-12-31"
    Then the end date field should not show any errors
    And the date range validation should pass

  @validation
  Scenario: Future date validation prevents future dates
    When I enter a start date in the future
    Then the start date field should show an error
    And the error should indicate "Start date cannot be in the future"
    And the form should remain valid

    When I enter an end date in the future
    Then the end date field should show an error
    And the error should indicate "End date cannot be in the future"
    And the form should remain valid

  @validation @smoke
  Scenario: Date range validation allows reasonable past dates
    When I enter a start date "2020-01-01"
    And I enter an end date "2023-12-31"
    Then both date fields should not show any errors
    And the date range validation should pass
    And the form should be valid

  @functionality
  Scenario: Clear dates button resets date fields
    Given I have entered a start date "2023-01-01"
    And I have entered an end date "2023-12-31"
    When I click the clear dates button
    Then the start date field should be empty
    And the end date field should be empty
    And the form should be valid

  @functionality
  Scenario: Date range settings persist when navigating back
    Given I have entered a start date "2023-01-01"
    And I have entered an end date "2023-12-31"
    When I navigate back to the auth step
    And I navigate forward to the config step
    Then the start date should still be "2023-01-01"
    And the end date should still be "2023-12-31"

