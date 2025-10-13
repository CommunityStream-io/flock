Feature: Splash Screen Direct Testing
  As a user
  I want to see a splash screen during authentication
  So that I know the system is processing my request

  @auth @ui @parallel
  Scenario: Splash screen displays when authentication is triggered
    Given I am on the auth page with valid file state
    And I have entered valid credentials
    When I trigger the authentication process
    Then I should see the splash screen
    And the splash screen should display "Authenticating with bsky.social"
    And the splash screen should disappear after authentication completes
