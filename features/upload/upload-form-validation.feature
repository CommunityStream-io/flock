@skip
Feature: Upload Form Validation - Error Handling and User Feedback

  As a user attempting to proceed without proper file selection
  I want to see clear validation errors and feedback
  So that I can understand what's required to continue

  Background:
    And I navigate to the upload step

  @upload @core @validation @parallel
  Scenario: Form validation shows error when proceeding without file
    When I try to proceed without a file
    Then I should see an error message
    And the form should remain on the upload step
