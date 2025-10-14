@electron @integration @smoke @critical @serial
Feature: CLI Integration via IPC
  As a Flock Native user
  I want the migration CLI to execute successfully via Electron IPC
  So that I can migrate my Instagram posts to Bluesky
  
  Background:
    Given the Electron app is running
    And I am on the migration step

  Scenario: CLI path is correctly resolved in packaged app
    When I check the CLI path resolution
    Then the CLI executable should exist in the unpacked directory
    And the path should point to "@straiforos/instagramtobluesky/dist/main.js"
    
  Scenario: Execute CLI and receive output
    Given I have valid Bluesky credentials
    And I have selected a test Instagram archive
    When I trigger migration via IPC
    Then the CLI process should start successfully
    And I should receive a valid process ID
    And I should receive CLI output via IPC events
    
  Scenario: CLI execution completes successfully
    Given I have valid Bluesky credentials
    And I have selected the test video archive
    When I trigger migration in simulate mode
    Then the CLI should process the archive
    And I should see progress updates
    And the process should complete without errors
    And I should see a completion message
    
  Scenario: CLI execution handles errors gracefully
    Given I have invalid Bluesky credentials
    And I have selected a test Instagram archive
    When I trigger migration via IPC
    Then I should receive an authentication error
    And the error should be displayed to the user
    
  Scenario: CLI process can be cancelled
    Given I have valid Bluesky credentials
    And I have selected a test Instagram archive
    When I start a migration
    And I cancel the migration before it completes
    Then the CLI process should be terminated
    And I should see a cancellation confirmation
    
  @os:windows
  Scenario: CLI execution works on Windows
    Given I am running on Windows
    And I have valid Bluesky credentials
    When I trigger migration via IPC
    Then the CLI should execute using the bundled Node.js runtime
    And the Windows-specific path resolution should work
    
  Scenario: Multiple CLI executions can run sequentially
    Given I have valid Bluesky credentials
    And I have selected a test Instagram archive
    When I trigger migration via IPC
    And I wait for the process to complete
    And I trigger another migration
    Then both processes should execute successfully
    And each should have a unique process ID



