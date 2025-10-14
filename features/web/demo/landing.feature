@web @landing @core @parallel
Feature: Flock Landing Page - Birds of a Feather Migrate Together

  As a user interested in migrating from Instagram to Bluesky
  I want to understand the migration process and start my journey
  So that I can preserve my social media memories in a decentralized platform

  @smoke
  Scenario: Landing page displays migration information and process
    And I am on the landing page
    Then I should see the main title "Flock: Birds of a Feather Migrate Together"
    And I should see the subtitle about spreading wings to Bluesky's decentralized skies
    And I should see the migration journey explanation
    And I should see three process steps numbered 1, 2, and 3

  @ui
  Scenario: Process steps show correct migration workflow
    Given I am on the landing page
    Then I should see step 1 titled "Upload Your Nest"
    And step 1 should describe "Drop your Instagram export files - we'll handle the rest"
    And I should see step 2 titled "Review & Customize"
    And step 2 should describe "Preview your content and adjust settings before takeoff"
    And I should see step 3 titled "Launch to Bluesky"
    And step 3 should describe "Watch your memories soar to their new home in the fediverse"

  @ui
  Scenario: Benefits section highlights key advantages
    Given I am on the landing page
    Then I should see "Why Choose Flock?" section
    And I should see a "Secure & Private" benefit card
    And the "Secure & Private" card should mention "Your data never leaves your nest"
    And I should see a "Multi-Platform" benefit card
    And the "Multi-Platform" card should mention "Fly from anywhere - web, desktop, or mobile"
    And I should see a "Fast & Efficient" benefit card
    And the "Fast & Efficient" card should mention "Swift as a swallow! Optimized processing"

  @navigation @smoke
  Scenario: Call-to-action buttons guide user to next steps
    Given I am on the landing page
    Then I should see a "Begin Your Journey" button
    And I should see an "Explore the Skies" button
    When I click the "Begin Your Journey" button
    Then I should be navigated to the upload step
    And the URL should contain "/step/upload"



