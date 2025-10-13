Feature: Configuration Step Overview - Complete Migration Setup

  As a user setting up my Instagram to Bluesky migration
  I want to configure all my migration preferences in one place
  So that my migration runs exactly as I want it to

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @config @overview @core @integration @parallel
  Scenario: Configuration step completes the migration setup
    Then I should see the configuration step header
    And I should see a clear description of what this step does
    And I should see all available configuration options
    And I should understand how to proceed to the next step

  @config @overview @core @integration @parallel
  Scenario: Configuration step integrates with previous steps
    Then I should see that my file upload is complete
    And I should see that my authentication is complete
    And I should see that configuration is the current step
    And I should understand the overall migration progress

  @config @overview @core @integration @parallel
  Scenario: Configuration step prepares for migration execution
    When I complete the configuration step
    Then I should be ready to start the migration
    And all necessary settings should be configured
    And the migration should have everything it needs to run

  @config @overview @ui @parallel
  Scenario: Configuration step provides a smooth user experience
    Then the configuration step should be intuitive
    And I should be able to complete it quickly
    And I should understand all the options available
    And I should feel confident about my choices

  @config @overview @ui @parallel
  Scenario: Configuration step handles different user skill levels
    When I am a beginner user
    Then I should see helpful guidance and explanations
    And I should be able to use default settings
    And I should understand what each option does

    When I am an advanced user
    Then I should have access to all configuration options
    And I should be able to fine-tune my settings
    And I should have control over all aspects of the migration

  @config @overview @ui @parallel
  Scenario: Configuration step provides peace of mind
    When I configure my migration settings
    Then I should feel confident about the migration
    And I should understand what will happen
    And I should know that my data is safe
    And I should know that I can test before committing

  @config @overview @integration @parallel
  Scenario: Configuration step integrates with the migration engine
    When I complete the configuration step
    Then my settings should be properly passed to the migration engine
    And the migration engine should have all necessary information
    And the migration should run according to my preferences

  @config @overview @integration @parallel
  Scenario: Configuration step integrates with progress tracking
    When I complete the configuration step
    Then my configuration should be saved
    And I should be able to see my configuration in progress tracking
    And I should be able to modify my configuration if needed

  @config @overview @integration @parallel
  Scenario: Configuration step integrates with error handling
    When I encounter errors during migration
    Then I should be able to return to configuration
    And I should be able to adjust my settings
    And I should be able to retry the migration

  @config @overview @parallel
  Scenario: Configuration step is designed for future growth
    Then the configuration step should be extensible
    And new options should integrate seamlessly
    And the user experience should remain consistent
    And the step should scale with new features

  @config @overview @parallel
  Scenario: Configuration step supports different migration types
    When new migration types are added
    Then the configuration step should adapt
    And relevant options should be shown
    And irrelevant options should be hidden
    And the user experience should remain intuitive

  @config @overview @parallel
  Scenario: Configuration step supports different platforms
    When new platforms are added
    Then the configuration step should adapt
    And platform-specific options should be shown
    And the user experience should remain consistent
    And the step should work across all platforms
