@core @electron @os:windows
Feature: Basic Electron App Verification
  As a developer
  I want to verify the Electron app launches correctly
  So that I can confirm cross-platform testing infrastructure works

  @os:windows
  Scenario: Electron app launches and loads successfully
    Given I am on the landing page
    Then I should see the main title "Flock"