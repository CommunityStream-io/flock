Feature: Splash Screen Display
  As a user
  I want to see a splash screen during authentication
  So that I know the system is processing my request

  @splash-screen @authentication
  Scenario: Splash screen displays during authentication
    Given I am on the auth step page
    And I have entered a valid username
    And I have entered a valid password
    When I click the "Next" button
    Then I should see the splash screen
    And the splash screen should display "Authenticating with bsky.social"
    And the authentication should process in the background
    And I should be navigated to the config step
