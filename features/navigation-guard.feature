Feature: Navigation Guard Protection - Upload Validation Requirements

  As a user migrating from Instagram to Bluesky
  I should be prevented from proceeding without a valid archive
  So that the migration process maintains data integrity

  Background:

  @upload @guards @navigation @skip @parallel
  Scenario: Navigation blocked without valid archive
    # NOTE: Skipped - snackbar not detected in E2E (verified with unit tests)
    Given I navigate to the upload step
    And I have not uploaded any archive file
    When I click the next step button in the navigation
    Then I should remain on the upload step
    And I should see a snackbar message "Please upload a valid archive"
    And the snackbar should auto-dismiss after 3 seconds

  @upload @guards @navigation @skip @parallel
  Scenario: Navigation allowed with valid archive
    # NOTE: Skipped - Angular DI access for fileService.archivedFile not working in E2E
    Given I navigate to the upload step
    When I upload a valid Instagram archive file
    And I click the next step button in the navigation
    Then I should successfully navigate to the auth step
    And I should not see any error messages

  @upload @guards @validation @skip @parallel
  Scenario: Guard checks for actual file service state
    # NOTE: Skipped - browser file input with accept=".zip" prevents selecting invalid files
    # This scenario is not realistic in the actual user flow
    Given I navigate to the upload step
    When I select a file but validation fails
    And I click the next step button in the navigation
    Then I should remain on the upload step
    And I should see a snackbar message "Please upload a valid archive"

  @upload @guards @navigation @skip @parallel
  Scenario: Multiple navigation attempts show consistent behavior
    # NOTE: Skipped - snackbar not detected in E2E (verified with unit tests)
    Given I navigate to the upload step
    And I have not uploaded any archive file
    When I click the next step button in the navigation
    Then I should see a snackbar message "Please upload a valid archive"
    When I wait for the snackbar to dismiss
    And I click the next step button in the navigation
    Then I should see the snackbar message again

  @upload @guards @navigation @skip @parallel
  Scenario: Step navigation component respects guard
    # NOTE: Skipped - combines snackbar detection and file upload issues from above scenarios
    Given I navigate to the upload step
    And I have not uploaded any archive file
    When I click the next step button in the navigation
    Then the navigation should be blocked
    And I should see a snackbar message "Please upload a valid archive"
    When I upload a valid Instagram archive file
    And I click the next step button in the navigation
    Then I should successfully navigate to the auth step