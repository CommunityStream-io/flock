Feature: Migration Testing - Safe Testing and Simulation Options

  As a user testing my migration
  I want to use safe testing and simulation options
  So that I can verify my migration without posting to Bluesky

  Background:
    Given the application is running
    And the splash screen message should be "*flap* *flap* *flap*"
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @config @testing @simulation
  Scenario: Testing options section displays correctly
    Then I should see the testing options section
    And I should see a test video mode toggle
    And I should see a simulation mode toggle
    And I should see descriptions for each option
    And both toggles should be initially disabled

  @config @testing @simulation
  Scenario: Test video mode toggle works correctly
    When I click the test video mode toggle
    Then the test video mode should be enabled
    And the toggle should show as active
    And the form should be valid

    When I click the test video mode toggle again
    Then the test video mode should be disabled
    And the toggle should show as inactive
    And the form should be valid

  @config @testing @simulation
  Scenario: Simulation mode toggle works correctly
    When I click the simulation mode toggle
    Then the simulation mode should be enabled
    And the toggle should show as active
    And the form should be valid

    When I click the simulation mode toggle again
    Then the simulation mode should be disabled
    And the toggle should show as inactive
    And the form should be valid

  @config @testing @simulation
  Scenario: Both testing modes can be enabled simultaneously
    When I enable test video mode
    And I enable simulation mode
    Then the test video mode should be enabled
    And the simulation mode should be enabled
    And both toggles should show as active
    And the form should be valid

  @config @testing @simulation
  Scenario: Testing mode settings are saved to service
    When I enable test video mode
    And I enable simulation mode
    Then the configuration service should be updated
    And the test video mode setting should be stored
    And the simulation mode setting should be stored

  @config @testing @simulation
  Scenario: Testing mode settings persist when navigating back
    Given I have enabled test video mode
    And I have enabled simulation mode
    When I navigate back to the auth step
    And I navigate forward to the config step
    Then the test video mode should still be enabled
    And the simulation mode should still be enabled

  @config @testing @simulation
  Scenario: Testing mode descriptions are clear and helpful
    Then the test video mode description should explain its purpose
    And the simulation mode description should explain its purpose
    And the descriptions should be user-friendly
    And the descriptions should explain the benefits of each mode

  @config @testing @simulation
  Scenario: Testing modes affect migration behavior
    Given I have enabled test video mode
    When I proceed to the migrate step
    Then the migration should run in test video mode
    And the migration should process videos for testing

    Given I have enabled simulation mode
    When I proceed to the migrate step
    Then the migration should run in simulation mode
    And no actual posts should be created

  @config @testing @simulation
  Scenario: Testing mode combinations work correctly
    Given I have enabled both test video mode and simulation mode
    When I proceed to the migrate step
    Then the migration should run in both test video and simulation mode
    And the migration should process videos for testing without posting

  @config @testing @help @dialog
  Scenario: Help dialog provides testing mode guidance
    When I click the help icon for testing options
    Then I should see a help dialog with testing guidance
    And the dialog should explain test video mode
    And the dialog should explain simulation mode
    And the dialog should explain when to use each mode
    When I close the help dialog
    Then the help dialog should be hidden

  @config @testing @help @dialog @escape
  Scenario: Help dialog can be closed with Escape key
    When I click the help icon for testing options
    Then I should see a help dialog with testing guidance
    When I close the help dialog with Escape key
    Then the help dialog should be hidden

  @config @testing @validation
  Scenario: Testing mode validation provides appropriate feedback
    Given I have enabled test video mode
    When I navigate away from the config step
    Then the configuration should be validated
    And I should see validation success indicators
    And the test video mode setting should be confirmed

  @config @testing @edge-cases
  Scenario: Testing modes handle edge cases gracefully
    When I rapidly toggle test video mode multiple times
    Then the test video mode should be in the final state
    And the form should be valid

    When I rapidly toggle simulation mode multiple times
    Then the simulation mode should be in the final state
    And the form should be valid

  @config @testing @accessibility
  Scenario: Testing mode toggles are accessible
    Then the test video mode toggle should be keyboard accessible
    And the simulation mode toggle should be keyboard accessible
    And both toggles should have proper ARIA labels
    And both toggles should have proper focus indicators
