@electron @platform:electron @upload
Feature: Native File Dialog
  As a Flock Native user
  I want to use my operating system's native file picker
  So that I have a familiar and consistent file selection experience
  
  Background:
    Given the Electron app is running
    And I am on the upload step
    
  @os:windows
  Scenario: Windows native dialog
    Given I am running on Windows
    When I click the file selection button
    Then a native Windows file dialog should be available
    And the dialog should filter for ZIP files
    And the dialog should show the correct title
    
  @os:macos
  Scenario: macOS native dialog
    Given I am running on macOS
    When I click the file selection button
    Then a native macOS file dialog should be available
    And the dialog should filter for ZIP files
    And the dialog should use macOS styling
    
  @os:linux
  Scenario: Linux native dialog
    Given I am running on Linux
    When I click the file selection button
    Then a native Linux file dialog should be available
    And the dialog should filter for ZIP files
    
  Scenario: File dialog allows navigation
    When I trigger the file selection dialog via IPC
    Then I should be able to navigate directories
    And I should be able to select a file
    And the selected file path should be returned
    
  Scenario: File dialog validates file types
    When I select a file via the native dialog
    Then only ZIP files should be selectable
    And other file types should be grayed out or hidden
    
  Scenario: Cancel file dialog
    When I open the file selection dialog
    And I cancel the dialog
    Then no file should be selected
    And the application should remain on the upload step



