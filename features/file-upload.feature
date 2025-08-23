Feature: File Upload and Validation - Instagram Archive Processing

  As a user migrating from Instagram to Bluesky
  I want to upload and validate my Instagram archive
  So that my data can be processed for migration

  Background:
    Given the application is running
    And I navigate to the upload step

  @file-upload @upload-interface
  Scenario: Upload interface displays correctly
    Then I should see the upload section
    And I should see the heading "Upload Your Files"
    And I should see the description "Upload instagram archive"
    And I should see a "Choose Files" button with upload icon
    And the file input should accept ".zip" files

  @file-upload @file-selection @skip
  Scenario: Valid file selection displays correctly
    When I select a valid Instagram archive file "instagram-export.zip"
    Then the file should be selected in the file input
    And I should see the selected files section
    And I should see "Selected Files:" heading
    And I should see "instagram-export.zip" in the file list
    And I should see a delete button for the selected file

  @file-upload @file-validation @skip
  Scenario: File validation provides feedback
    When I select a valid Instagram archive file "valid-archive.zip"
    Then the file validation should succeed
    And I should see validation success indicators
    When I select an invalid file "invalid-file.txt"
    Then the file validation should fail
    And I should see validation error messages

  @file-upload @file-removal @skip
  Scenario: File removal works correctly
    Given I have selected a valid Instagram archive file "test-archive.zip"
    When I click the delete button for "test-archive.zip"
    Then the file should be removed from the selection
    And the file input should be reset
    And I should not see the selected files section

  @file-upload @form-state @skip
  Scenario: Form state updates correctly with file operations
    Then the Instagram archive form control should be invalid initially
    When I select a valid Instagram archive file "archive.zip"
    Then the Instagram archive form control should be valid
    When I remove the selected file
    Then the Instagram archive form control should be invalid again