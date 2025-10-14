@electron @core @parallel
Feature: Window State Management
  As a Flock Native user
  I want the application window to remember my preferences
  So that I have a consistent experience across sessions
  
  @smoke
  Scenario: Window persists size on restart
    Given the Electron app is running
    When I resize the window to 1400x1000
    And I close the application
    And I restart the application
    Then the window should open at 1400x1000
    
  Scenario: Window persists position on restart
    Given the Electron app is running
    When I move the window to coordinates 100,100
    And I close the application
    And I restart the application
    Then the window should open at coordinates 100,100
    
  Scenario: Window respects minimum size
    Given the Electron app is running
    When I try to resize the window below 800x600
    Then the window should not shrink below the minimum size
    And the window size should be at least 800x600
    
  Scenario: Window can be maximized
    Given the Electron app is running
    When I maximize the window
    Then the window should fill the screen
    And the maximize state should be saved
    
  Scenario: Window state persists maximize preference
    Given the Electron app is running
    And the window is maximized
    When I close the application
    And I restart the application
    Then the window should open maximized
    
  Scenario: Window can be minimized and restored
    Given the Electron app is running
    When I minimize the window
    Then the window should minimize to the taskbar
    When I restore the window
    Then the window should return to its previous state



