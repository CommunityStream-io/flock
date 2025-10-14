Feature: File Validation - Archive File Verification and Error Handling

  As a user uploading my Instagram archive
  I want the system to validate my file format and content
  So that only valid archives are processed for migration

  Background:
    And I navigate to the upload step

  @upload @core @validation @parallel
  Scenario: File validation provides feedback
    When I select a valid Instagram archive file "valid-archive.zip"
    Then the file validation should succeed
    And I should see validation success indicators
    When I select an invalid file "invalid-file.txt"
    Then the file validation should fail
    And I should see validation error messages
