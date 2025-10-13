Feature: Configuration User Interface - Intuitive Migration Settings

  As a user configuring my migration
  I want an intuitive and user-friendly interface
  So that I can easily set up my migration preferences

  Background:
    And I navigate to the upload step
    And I select a valid Instagram archive file "valid-archive.zip"
    And I navigate to the auth step
    And I have entered valid credentials
    And I navigate to the config step

  @config @ui @parallel
  Scenario: Configuration form has clear visual hierarchy
    Then I should see a well-organized configuration form
    And I should see clear section headers
    And I should see logical grouping of related options
    And the form should be visually appealing
    And the form should be easy to scan

  @config @ui @parallel
  Scenario: Configuration form provides helpful descriptions
    Then I should see helpful descriptions for each option
    And the descriptions should explain what each setting does
    And the descriptions should explain when to use each setting
    And the descriptions should be written in plain language

  @config @ui @parallel
  Scenario: Configuration form has intuitive controls
    Then I should see intuitive form controls
    And date inputs should use date pickers
    And toggles should be clearly labeled
    And buttons should have descriptive text
    And the form should follow standard UI patterns

  @config @ui @parallel
  Scenario: Configuration form is responsive
    When I view the form on a mobile device
    Then the form should be mobile-friendly
    And all controls should be easily tappable
    And the form should be readable on small screens

    When I view the form on a tablet
    Then the form should be tablet-friendly
    And the layout should adapt appropriately
    And all controls should be easily accessible

  @config @ui @parallel
  Scenario: Configuration form has proper spacing and alignment
    Then the form should have consistent spacing
    And elements should be properly aligned
    And there should be adequate white space
    And the form should not feel cramped

  @config @ui @accessibility @parallel
  Scenario: Configuration form is accessible
    Then all form controls should be keyboard accessible
    And all form controls should have proper labels
    And the form should have proper heading structure
    And the form should work with screen readers
    And the form should have proper focus indicators

  @config @ui @accessibility @parallel
  Scenario: Configuration form has proper color contrast
    Then text should have sufficient color contrast
    And form controls should be clearly visible
    And error messages should be clearly visible
    And success indicators should be clearly visible

  @config @ui @accessibility @parallel
  Scenario: Configuration form has proper ARIA attributes
    Then form controls should have proper ARIA labels
    And form sections should have proper ARIA landmarks
    And error messages should be properly associated with fields
    And success indicators should be properly associated with fields

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

  @config @ui @performance @parallel
  Scenario: Configuration form is responsive and fast
    When I interact with form controls
    Then the form should respond quickly
    And there should be no noticeable delays
    And the form should feel snappy and responsive

  @config @ui @performance @parallel
  Scenario: Configuration form handles large datasets efficiently
    When I have many configuration options
    Then the form should load quickly
    And the form should remain responsive
    And the form should not freeze or lag

  @config @ui @parallel
  Scenario: Configuration form is designed for future expansion
    Then the form should be designed to accommodate new options
    And the form should be modular and extensible
    And new options should integrate seamlessly
    And the form should maintain its usability as it grows

  @config @ui @parallel
  Scenario: Configuration form supports different migration types
    When new migration types are added
    Then the form should adapt to show relevant options
    And irrelevant options should be hidden
    And the form should remain intuitive

  @config @ui @parallel
  Scenario: Configuration form supports different platforms
    When new platforms are added
    Then the form should adapt to show platform-specific options
    And platform-specific options should be clearly marked
    And the form should remain consistent across platforms
