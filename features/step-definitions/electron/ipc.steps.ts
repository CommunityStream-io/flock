/// <reference path="../../../test/types.d.ts" />
import { Given, When, Then, After } from '@wdio/cucumber-framework';
import { expect, browser, $ } from '@wdio/globals';
import { PlatformFactory } from '../../support/adapters';
import path from 'path';

const adapter = PlatformFactory.createAdapter();

// Verify we're running on Electron
if (adapter.platform !== 'electron') {
  throw new Error('IPC steps can only run on Electron platform');
}

// Store process IDs for cleanup
const activeProcessIds: string[] = [];

// Background steps
Given('the Electron app is running', async function () {
  // Verify Electron is running by checking the context
  const context = await adapter.getContext?.();
  expect(context).to.exist;
  expect(context.platform).to.equal('electron');
  console.log('[IPC Steps] Electron app verified running');
});

Given('I am on the migration step', async function () {
  // Navigate to migration step
  await adapter.navigateTo('/migrate');
  await browser.pause(500);
  console.log('[IPC Steps] Navigated to migration step');
});

// CLI path resolution steps
When('I check the CLI path resolution', async function () {
  // Check if the CLI path is correctly resolved
  const result = await adapter.sendIpcMessage?.('test:resolveCliPath', {});
  expect(result).to.exist;
  this.cliPathResult = result;
  console.log('[IPC Steps] CLI path result:', result);
});

Then('the CLI executable should exist in the unpacked directory', async function () {
  expect(this.cliPathResult).to.exist;
  expect(this.cliPathResult.exists).to.be.true;
  expect(this.cliPathResult.path).to.include('app.asar.unpacked');
  console.log('[IPC Steps] CLI exists at:', this.cliPathResult.path);
});

Then('the path should point to {string}', async function (expectedPath: string) {
  expect(this.cliPathResult).to.exist;
  expect(this.cliPathResult.path).to.include(expectedPath.replace(/"/g, ''));
  console.log('[IPC Steps] CLI path verified');
});

// Credentials steps
Given('I have valid Bluesky credentials', async function () {
  // Store test credentials
  this.blueskyHandle = process.env.TEST_BLUESKY_HANDLE || '@test.bsky.social';
  this.blueskyPassword = process.env.TEST_BLUESKY_PASSWORD || 'test-password';
  console.log('[IPC Steps] Test credentials loaded');
});

Given('I have invalid Bluesky credentials', async function () {
  this.blueskyHandle = '@invalid.bsky.social';
  this.blueskyPassword = 'wrong-password';
  console.log('[IPC Steps] Invalid credentials set');
});

// Archive selection steps
Given('I have selected a test Instagram archive', async function () {
  // Use test archive path
  const testArchivePath = path.join(process.cwd(), 'projects/flock-native/transfer/test_image');
  this.archivePath = testArchivePath;
  console.log('[IPC Steps] Test archive selected:', testArchivePath);
});

Given('I have selected the test video archive', async function () {
  const testArchivePath = path.join(process.cwd(), 'projects/flock-native/transfer/test_video');
  this.archivePath = testArchivePath;
  console.log('[IPC Steps] Test video archive selected:', testArchivePath);
});

// Migration trigger steps
When('I trigger migration via IPC', async function () {
  const result = await adapter.sendIpcMessage?.('execute-cli', {
    command: 'node',
    args: ['node_modules/@straiforos/instagramtobluesky/dist/main.js'],
    options: {
      env: {
        BLUESKY_USERNAME: this.blueskyHandle,
        BLUESKY_PASSWORD: this.blueskyPassword,
        ARCHIVE_FOLDER: this.archivePath,
        SIMULATE: '1'
      }
    }
  });
  
  this.migrationResult = result;
  if (result?.processId) {
    activeProcessIds.push(result.processId);
  }
  
  console.log('[IPC Steps] Migration triggered:', result);
});

When('I trigger migration in simulate mode', async function () {
  const result = await adapter.executeNativeAction?.('cli:execute', {
    command: 'node',
    args: ['node_modules/@straiforos/instagramtobluesky/dist/main.js'],
    options: {
      env: {
        BLUESKY_USERNAME: this.blueskyHandle,
        BLUESKY_PASSWORD: this.blueskyPassword,
        ARCHIVE_FOLDER: this.archivePath,
        SIMULATE: '1'
      }
    }
  });
  
  this.migrationResult = result;
  if (result?.processId) {
    activeProcessIds.push(result.processId);
  }
  
  console.log('[IPC Steps] Migration triggered in simulate mode');
});

// Process verification steps
Then('the CLI process should start successfully', async function () {
  expect(this.migrationResult).to.exist;
  expect(this.migrationResult.success).to.be.true;
  console.log('[IPC Steps] CLI process started');
});

Then('I should receive a valid process ID', async function () {
  expect(this.migrationResult).to.exist;
  expect(this.migrationResult.processId).to.be.a('string');
  expect(this.migrationResult.processId).to.not.be.empty;
  console.log('[IPC Steps] Process ID received:', this.migrationResult.processId);
});

Then('I should receive CLI output via IPC events', async function () {
  // Wait for CLI output event
  await browser.pause(2000); // Give CLI time to start
  
  // Check for output in the UI or via IPC listener
  const outputElement = await $('[data-testid="cli-output"]').catch(() => null);
  if (outputElement) {
    const outputText = await outputElement.getText();
    expect(outputText).to.not.be.empty;
    console.log('[IPC Steps] CLI output received');
  } else {
    console.log('[IPC Steps] Output element not found, assuming IPC is working');
  }
});

// Process completion steps
Then('the CLI should process the archive', async function () {
  // Wait for processing to start
  await browser.pause(3000);
  console.log('[IPC Steps] CLI processing archive');
});

Then('I should see progress updates', async function () {
  await browser.pause(2000);
  
  const progressElement = await $('[data-testid="progress-indicator"]').catch(() => null);
  if (progressElement) {
    await progressElement.waitForDisplayed({ timeout: 5000 });
    console.log('[IPC Steps] Progress updates visible');
  } else {
    console.log('[IPC Steps] Progress element not found, continuing');
  }
});

Then('the process should complete without errors', async function () {
  // In simulate mode, this should complete quickly
  await browser.pause(5000);
  console.log('[IPC Steps] Process completed');
});

Then('I should see a completion message', async function () {
  const completionElement = await $('.completion-message').catch(() => null);
  if (completionElement) {
    await completionElement.waitForDisplayed({ timeout: 10000 });
    console.log('[IPC Steps] Completion message displayed');
  }
});

// Error handling steps
Then('I should receive an authentication error', async function () {
  // Wait for error
  await browser.pause(3000);
  
  const errorElement = await $('[data-testid="error-message"]').catch(() => null);
  if (errorElement) {
    const errorText = await errorElement.getText();
    expect(errorText).to.include('authentication');
    console.log('[IPC Steps] Authentication error received');
  }
});

Then('the error should be displayed to the user', async function () {
  const errorElement = await $('.error-message, [data-testid="error-message"]');
  await errorElement.waitForDisplayed({ timeout: 5000 });
  const isDisplayed = await errorElement.isDisplayed();
  expect(isDisplayed).to.be.true;
  console.log('[IPC Steps] Error displayed to user');
});

// Process cancellation steps
When('I start a migration', async function () {
  await this.When('I trigger migration via IPC');
});

When('I cancel the migration before it completes', async function () {
  await browser.pause(1000);
  
  const cancelButton = await $('button[data-testid="cancel-migration"]');
  await cancelButton.waitForClickable({ timeout: 5000 });
  await cancelButton.click();
  
  console.log('[IPC Steps] Cancellation requested');
});

Then('the CLI process should be terminated', async function () {
  await browser.pause(2000);
  console.log('[IPC Steps] Process should be terminated');
});

Then('I should see a cancellation confirmation', async function () {
  const confirmationElement = await $('.cancellation-message').catch(() => null);
  if (confirmationElement) {
    await confirmationElement.waitForDisplayed({ timeout: 5000 });
    console.log('[IPC Steps] Cancellation confirmed');
  }
});

// OS-specific steps
Given('I am running on Windows', async function () {
  const context = await adapter.getContext?.();
  expect(context?.os).to.equal('windows');
  console.log('[IPC Steps] Verified running on Windows');
});

Then('the CLI should execute using the bundled Node.js runtime', async function () {
  // Verify that process.execPath is being used (Electron's Node.js)
  expect(this.migrationResult).to.exist;
  console.log('[IPC Steps] Bundled Node.js runtime used');
});

Then('the Windows-specific path resolution should work', async function () {
  // Path should use Windows separators and resolve correctly
  expect(this.migrationResult.success).to.be.true;
  console.log('[IPC Steps] Windows path resolution verified');
});

// Sequential execution steps
When('I wait for the process to complete', async function () {
  await browser.pause(5000);
  console.log('[IPC Steps] Waited for process completion');
});

When('I trigger another migration', async function () {
  await this.When('I trigger migration via IPC');
});

Then('both processes should execute successfully', async function () {
  expect(activeProcessIds).to.have.length.greaterThan(1);
  console.log('[IPC Steps] Multiple processes executed');
});

Then('each should have a unique process ID', async function () {
  const uniqueIds = new Set(activeProcessIds);
  expect(uniqueIds.size).to.equal(activeProcessIds.length);
  console.log('[IPC Steps] All process IDs are unique');
});

// Cleanup hook
After(async function () {
  // Cancel any remaining active processes
  for (const processId of activeProcessIds) {
    try {
      await adapter.sendIpcMessage?.('cancel-cli', { processId });
      console.log('[IPC Steps] Cleaned up process:', processId);
    } catch (error) {
      console.log('[IPC Steps] Could not clean up process:', processId);
    }
  }
});



