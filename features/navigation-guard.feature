@skip
Feature: Navigation Guard Protection - Upload Validation Requirements

  As a user migrating from Instagram to Bluesky
  I should be prevented from proceeding without a valid archive
  So that the migration process maintains data integrity

  Background:
    Given the application is running

  @navigation-guard @upload-guard 
  Scenario: Navigation blocked without valid archive
    Given I navigate to the upload step
    And I have not uploaded any archive file
    When I attempt to navigate to the auth step directly
    Then I should remain on the upload step
    And I should see a snackbar message "Please upload a valid archive"
    And the snackbar should auto-dismiss after 3 seconds

  @navigation-guard @guard-bypass
  Scenario: Navigation allowed with valid archive
    Given I navigate to the upload step
    When I upload a valid Instagram archive file
    And I attempt to navigate to the auth step directly
    Then I should successfully navigate to the auth step
    And I should not see any error messages

  @navigation-guard @guard-validation 
  Scenario: Guard checks for actual file service state
    Given I navigate to the upload step
    When I select a file but validation fails
    And I attempt to navigate to the auth step directly
    Then I should remain on the upload step
    And I should see a snackbar message "Please upload a valid archive"

  @navigation-guard @multiple-attempts 
  Scenario: Multiple navigation attempts show consistent behavior
    Given I navigate to the upload step
    And I have not uploaded any archive file
    When I attempt to navigate to the auth step directly
    Then I should see a snackbar message "Please upload a valid archive"
    When I wait for the snackbar to dismiss
    And I attempt to navigate to the auth step again
    Then I should see the snackbar message again

  @navigation-guard @step-navigation-integration 
  Scenario: Step navigation component respects guard
    Given I navigate to the upload step
    And I have not uploaded any archive file
    When I click the next step button in the navigation
    Then the navigation should be blocked
    And I should see a snackbar message "Please upload a valid archive"
    When I upload a valid Instagram archive file
    And I click the next step button in the navigation
    Then I should successfully navigate to the auth step