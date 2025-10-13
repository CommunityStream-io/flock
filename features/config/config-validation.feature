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

  @config @validation @core @parallel
  Scenario: Configuration form is initially valid
    Then the configuration form should be valid
    And I should not see any validation errors
    And the "Next" button should be enabled
    And I should see validation success indicators

  @config @validation @core @parallel
  Scenario: Configuration form remains valid with default settings
    Given I have not changed any configuration settings
    When I attempt to navigate to the next step
    Then the configuration form should be valid
    And I should not see any validation errors
    And the navigation should be allowed

  @config @validation @core @parallel
  Scenario: Configuration form remains valid with valid changes
    When I enable test video mode
    And I enable simulation mode
    And I enter a valid start date "2023-01-01"
    And I enter a valid end date "2023-12-31"
    Then the configuration form should be valid
    And I should not see any validation errors
    And the "Next" button should be enabled

  @config @validation @parallel
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

  @config @validation @parallel
  Scenario: Date range validation errors are displayed clearly
    When I enter a start date "2023-12-31"
    And I enter an end date "2023-01-01"
    Then the end date field should show an error
    And the error should be clearly visible
    And the error should indicate "End date must be after start date"
    And the form should remain valid

  @config @validation @parallel
  Scenario: Future date validation errors are displayed clearly
    When I enter a start date in the future
    Then the start date field should show an error
    And the error should be clearly visible
    And the error should indicate "Start date cannot be in the future"
    And the form should remain valid

    When I enter an end date in the future
    Then the end date field should show an error
    And the error should be clearly visible
    And the error should indicate "End date cannot be in the future"
    And the form should remain valid

  @config @validation @parallel
  Scenario: Validation errors are cleared when fixed
    Given I have entered an invalid start date "invalid-date"
    And the start date field shows an error
    When I enter a valid start date "2023-01-01"
    Then the start date field should not show any errors
    And the error should be cleared
    And the form should be valid

  @config @validation @parallel
  Scenario: Date range validation errors are cleared when fixed
    Given I have entered a start date "2023-12-31"
    And I have entered an end date "2023-01-01"
    And the end date field shows an error
    When I enter a valid end date "2023-12-31"
    Then the end date field should not show any errors
    And the error should be cleared
    And the form should be valid

  @config @validation @parallel
  Scenario: Future date validation errors are cleared when fixed
    Given I have entered a start date in the future
    And the start date field shows an error
    When I enter a valid past start date "2023-01-01"
    Then the start date field should not show any errors
    And the error should be cleared
    And the form should be valid

  @config @validation @core @parallel
  Scenario: Configuration form state updates correctly
    When I make changes to the configuration
    Then the form should be marked as dirty
    And the form should be marked as touched
    And the form should be valid

    When I reset the form to its original state
    Then the form should be marked as pristine
    And the form should be valid

  @config @validation @core @parallel
  Scenario: Configuration form validation is real-time
    When I start typing in the start date field
    Then validation should occur as I type
    And errors should appear immediately for invalid input
    And errors should disappear immediately for valid input

  @config @validation @core @parallel
  Scenario: Configuration form validation occurs on blur
    When I enter an invalid start date "invalid-date"
    And I click outside the start date field
    Then the start date field should show an error
    And the error should be clearly visible

  @config @validation @core @parallel
  Scenario: Configuration form validation occurs on form submission
    Given I have entered an invalid start date "invalid-date"
    When I attempt to navigate to the next step
    Then the start date field should show an error
    And the navigation should be blocked
    And I should remain on the config step

  @config @validation @core @parallel
  Scenario: Configuration form validation occurs on field change
    When I change the start date field
    Then validation should occur immediately
    And any errors should be displayed immediately
    And any valid input should clear errors immediately

  @config @validation @accessibility @parallel
  Scenario: Validation errors are accessible
    When I enter an invalid start date "invalid-date"
    Then the start date field should have proper ARIA attributes
    And the error message should be associated with the field
    And the error message should be announced to screen readers
    And the error message should be clearly visible

  @config @validation @accessibility @parallel
  Scenario: Validation success indicators are accessible
    When I enter a valid start date "2023-01-01"
    Then the start date field should have proper ARIA attributes
    And the success indicator should be associated with the field
    And the success indicator should be announced to screen readers
    And the success indicator should be clearly visible

  @config @validation @edge-case @parallel
  Scenario: Configuration validation handles edge cases gracefully
    When I enter a start date "2023-02-29"
    Then the start date field should show an error
    And the error should indicate "Please enter a valid date"

    When I enter a start date "2023-04-31"
    Then the start date field should show an error
    And the error should indicate "Please enter a valid date"

    When I enter a start date "2023-01-01"
    And I enter an end date "2023-01-01"
    Then both date fields should not show any errors
    And the form should be valid

  @config @validation @performance @parallel
  Scenario: Configuration validation is performant
    When I rapidly change the start date field multiple times
    Then validation should occur efficiently
    And the form should remain responsive
    And errors should be displayed without delay

  @config @validation @performance @parallel
  Scenario: Configuration validation does not block user input
    When I am typing in the start date field
    Then the input should not be blocked by validation
    And I should be able to type continuously
    And validation should occur in the background
