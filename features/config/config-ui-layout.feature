Feature: Configuration UI Layout - Responsive and Accessible Design

  As a user configuring my migration on any device
  I want a well-organized and responsive interface
  So that I can configure settings on any screen size

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
  Scenario: Configuration form has proper spacing and alignment
    Then the form should have consistent spacing
    And elements should be properly aligned
    And there should be adequate white space
    And the form should not feel cramped

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

