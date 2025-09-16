Feature: Authentication Navigation Guards - Route Protection and Validation

  As a user navigating through the authentication process
  I want to be prevented from skipping required authentication steps
  So that the migration process is completed correctly

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step

  @bluesky-auth @validation
  Scenario: Navigation guard prevents progression without valid credentials
    And I am on the auth step page without valid credentials
    When I attempt to navigate to the config step
    Then the navigation should be blocked
    And I should see a snackbar error message
    And the error should indicate "Please provide valid Bluesky credentials"
    And I should remain on the auth step

    Given I have successfully authenticated
    When I attempt to navigate to the config step
    Then the navigation should succeed
    And I should be on the config step page

  @bluesky-auth @navigation @auth-guard
  Scenario: Navigation to previous step is always allowed
    Given I am on the auth step page
    When I attempt to navigate to the upload step
    Then the navigation should be allowed
    And I should be on the upload step
    And no authentication should be triggered

  @bluesky-auth @navigation @authentication @auth-guard
  Scenario: Navigation to next step blocks when credentials are not stored
    Given I am on the auth step page
    And I have entered valid credentials
    When I attempt to navigate to the config step
    Then the navigation should be blocked
    And I should see a snackbar error message
    And the error should indicate "Please provide valid Bluesky credentials"
    And I should remain on the auth step
    And no authentication process should be triggered

  @bluesky-auth @navigation @authentication @auth-guard
  Scenario: Navigation to next step blocks with invalid credentials
    Given I am on the auth step page
    And I have entered invalid credentials
    When I attempt to navigate to the config step
    Then the navigation should be blocked
    And I should see a snackbar error message
    And the error should indicate "Please provide valid Bluesky credentials"
    And I should remain on the auth step
    And no authentication process should be triggered

  @bluesky-auth @navigation @authentication @auth-guard
  Scenario: Navigation to next step fails when no credentials are provided
    Given I am on the auth step page
    And I have not entered any credentials
    When I attempt to navigate to the config step
    Then the navigation should be blocked
    And I should see a snackbar error message
    And the error should indicate "Please provide valid Bluesky credentials"
    And I should remain on the auth step
    And no authentication process should be triggered

  @bluesky-auth @navigation @authentication @auth-guard
  Scenario: Already authenticated user navigation is blocked when credentials not stored
    Given I am on the auth step page
    And I have already been authenticated
    When I attempt to navigate to the config step
    Then the navigation should be blocked
    And I should see a snackbar error message
    And the error should indicate "Please provide valid Bluesky credentials"
    And I should remain on the auth step
    And no authentication process should be triggered

  @bluesky-auth @navigation @auth-guard
  Scenario: Direct URL navigation triggers authentication process
    Given I am on the auth step page
    When I attempt to navigate to a different URL directly
    Then the navigation should be blocked
    And I should see a snackbar error message
    And the error should indicate "Please provide valid Bluesky credentials"
    And I should remain on the auth step
    And no authentication process should be triggered

  @bluesky-auth @navigation @authentication @auth-guard @network-error
  Scenario: Network error credentials still block navigation
    Given I am on the auth step page
    And I have entered credentials that will cause a network error
    When I attempt to navigate to the config step
    Then the navigation should be blocked
    And I should see a snackbar error message
    And the error should indicate "Please provide valid Bluesky credentials"
    And I should remain on the auth step
    And no authentication process should be triggered
