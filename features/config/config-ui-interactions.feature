Feature: Configuration UI Interactions - Intuitive Controls

  As a user configuring my migration
  I want intuitive and interactive form controls
  So that I can easily adjust my migration settings

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @config @ui @parallel
  Scenario: Configuration form has intuitive controls
    Then I should see intuitive form controls
    And date inputs should use date pickers
    And toggles should be clearly labeled
    And buttons should have descriptive text
    And the form should follow standard UI patterns

  @config @ui @parallel
  Scenario: Configuration form provides helpful descriptions
    Then I should see helpful descriptions for each option
    And the descriptions should explain what each setting does
    And the descriptions should explain when to use each setting
    And the descriptions should be written in plain language

  @config @ui @help @parallel
  Scenario: Configuration form has contextual help
    Then I should see help icons next to complex options
    And I should be able to access help for each section
    And help content should be contextual and relevant
    And help content should be easy to understand

  @config @ui @help @parallel
  Scenario: Configuration form has tooltips for quick guidance
    When I hover over form controls
    Then I should see helpful tooltips
    And tooltips should provide quick guidance
    And tooltips should not be overwhelming

  @config @ui @help @parallel
  Scenario: Configuration form has progressive disclosure
    When I need more advanced options
    Then I should be able to access advanced settings
    And advanced settings should be clearly marked
    And advanced settings should not clutter the main interface

  @config @ui @parallel
  Scenario: Configuration form provides clear feedback
    When I make changes to the configuration
    Then I should see clear visual feedback
    And the form should indicate what has changed
    And the form should show the current state clearly

  @config @ui @parallel
  Scenario: Configuration form shows validation feedback clearly
    When I enter invalid data
    Then I should see clear error messages
    And error messages should be positioned near the relevant field
    And error messages should be easy to understand
    And error messages should suggest how to fix the problem

  @config @ui @parallel
  Scenario: Configuration form shows success feedback clearly
    When I enter valid data
    Then I should see clear success indicators
    And success indicators should be positioned near the relevant field
    And success indicators should be subtle but visible
    And success indicators should confirm the input is correct

  @config @ui @navigation @parallel
  Scenario: Configuration form has clear navigation
    Then I should see clear navigation buttons
    And the "Back" button should be clearly labeled
    And the "Next" button should be clearly labeled
    And the navigation should be intuitive

  @config @ui @navigation @parallel
  Scenario: Configuration form shows progress
    Then I should see progress indicators
    And I should know which step I'm on
    And I should know how many steps remain
    And the progress should be visually clear

