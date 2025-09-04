Feature: File Management - File Selection, Removal, and UI Updates

  As a user managing my uploaded files
  I want to easily select, remove, and manage my archive files
  So that I can control which files are processed for migration

  Background:
    Given the application is running
    And the splash screen message should be "*flap* *flap* *flap*"
    And I navigate to the upload step

  @file-upload @file-removal 
  Scenario: File removal works correctly
    Given I have selected a valid Instagram archive file "test-archive.zip"
    When I click the delete button for "test-archive.zip"
    Then the file should be removed from the selection
    And the file input should be reset
    And I should not see the selected files section
    And the "Choose Files" button should be visible again

  @file-upload @button-visibility
  Scenario: Upload button visibility changes with file selection
    Given I am on the upload step
    Then I should see the "Choose Files" button
    When I select a valid Instagram archive file "test-archive.zip"
    Then the "Choose Files" button should be hidden
    When I remove the selected file
    Then the "Choose Files" button should be visible again
