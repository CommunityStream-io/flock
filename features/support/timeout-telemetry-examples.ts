/**
 * Timeout Telemetry Usage Examples
 * 
 * This file demonstrates how to use the timeout telemetry system
 * in your test steps and page objects.
 */

import { browser } from '@wdio/globals';
import { performanceMonitor } from './performance-monitor';
import { timeoutTelemetry } from './timeout-telemetry';
import { timeouts } from './timeout-config';

/**
 * Example: Using timeout telemetry in test steps
 */
export class TimeoutTelemetryExamples {
  
  /**
   * Example 1: Basic element interaction with timeout tracking
   */
  async clickElementWithTelemetry(selector: string, elementName: string) {
    return await performanceMonitor.monitorElementInteraction(
      () => browser.$(selector).click(),
      'click',
      elementName
    );
  }

  /**
   * Example 2: WaitUntil with custom timeout and telemetry
   */
  async waitForElementWithTelemetry(selector: string, timeout: number = timeouts.uiInteraction) {
    return await performanceMonitor.monitorWaitUntil(
      () => browser.$(selector).isDisplayed(),
      { 
        timeout, 
        timeoutMsg: `Element ${selector} did not appear within ${timeout}ms` 
      },
      `wait_for_${selector}`
    );
  }

  /**
   * Example 3: Navigation with timeout tracking
   */
  async navigateWithTelemetry(url: string) {
    return await performanceMonitor.monitorNavigation(url);
  }

  /**
   * Example 4: Custom operation with timeout monitoring
   */
  async customOperationWithTelemetry(operation: () => Promise<any>, operationName: string, timeout: number = 10000) {
    return await performanceMonitor.monitorWithTimeout(
      operation,
      operationName,
      timeout,
      'custom_operation'
    );
  }

  /**
   * Example 5: Script execution with telemetry
   */
  async executeScriptWithTelemetry(script: string, description: string) {
    return await performanceMonitor.monitorScriptExecution(
      script,
      undefined,
      description
    );
  }

  /**
   * Example 6: Manual timeout recording (for custom scenarios)
   */
  async recordCustomTimeout(operation: string, timeout: number, actualDuration: number, element?: string) {
    await timeoutTelemetry.recordTimeout(
      operation,
      timeout,
      actualDuration,
      'custom',
      element
    );
  }

  /**
   * Example 7: Recording successful operations for comparison
   */
  async recordSuccessfulOperation(operation: string, duration: number, element?: string) {
    await timeoutTelemetry.recordSuccess(
      operation,
      duration,
      'custom',
      element
    );
  }

  /**
   * Example 8: Page object method with comprehensive timeout tracking
   */
  async fillFormFieldWithTelemetry(fieldSelector: string, value: string, fieldName: string) {
    const startTime = Date.now();
    
    try {
      // Wait for field to be visible
      await this.waitForElementWithTelemetry(fieldSelector, timeouts.uiInteraction);
      
      // Clear and fill the field
      await performanceMonitor.monitorElementInteraction(
        async () => {
          const field = browser.$(fieldSelector);
          await field.clearValue();
          await field.setValue(value);
        },
        'input',
        fieldName
      );
      
      // Record successful operation
      const duration = Date.now() - startTime;
      await timeoutTelemetry.recordSuccess(
        `fill_form_field_${fieldName}`,
        duration,
        fieldName
      );
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.message.includes('timed out')) {
        await timeoutTelemetry.recordTimeout(
          `fill_form_field_${fieldName}`,
          timeouts.uiInteraction,
          duration,
          'custom',
          fieldName
        );
      }
      
      throw error;
    }
  }

  /**
   * Example 9: Retry mechanism with timeout tracking
   */
  async retryOperationWithTelemetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    timeout: number = timeouts.uiInteraction
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await performanceMonitor.monitorWithTimeout(
          operation,
          `${operationName}_attempt_${attempt}`,
          timeout,
          operationName
        );
        
        // Record successful retry
        if (attempt > 1) {
          await timeoutTelemetry.recordSuccess(
            `${operationName}_retry_success`,
            Date.now(),
            operationName
          );
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Record retry attempt
        await timeoutTelemetry.recordTimeout(
          `${operationName}_retry_${attempt}`,
          timeout,
          Date.now(),
          'custom',
          operationName,
          undefined,
          attempt
        );
        
        if (attempt < maxRetries) {
          // Wait before retry
          await browser.pause(1000 * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Example 10: Batch operation with timeout tracking
   */
  async batchOperationWithTelemetry(operations: Array<() => Promise<any>>, batchName: string) {
    const startTime = Date.now();
    const results = [];
    let successCount = 0;
    let timeoutCount = 0;
    
    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await performanceMonitor.monitorWithTimeout(
          operations[i],
          `${batchName}_operation_${i + 1}`,
          timeouts.uiInteraction,
          `${batchName}_batch`
        );
        
        results.push(result);
        successCount++;
        
      } catch (error) {
        if (error.message.includes('timed out')) {
          timeoutCount++;
        }
        results.push(null);
      }
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Record batch operation summary
    await timeoutTelemetry.recordSuccess(
      `${batchName}_batch_complete`,
      totalDuration,
      'custom',
      `${successCount}_success_${timeoutCount}_timeouts`
    );
    
    return results;
  }
}

/**
 * Example: Using timeout telemetry in step definitions
 */
export class TimeoutTelemetryStepDefinitions {
  
  /**
   * Example step definition with timeout tracking
   */
  async whenUserClicksButton(buttonText: string) {
    const examples = new TimeoutTelemetryExamples();
    
    await examples.clickElementWithTelemetry(
      `button:contains("${buttonText}")`,
      `button_${buttonText}`
    );
  }

  /**
   * Example step definition with wait and timeout tracking
   */
  async thenUserShouldSeeElement(elementDescription: string, selector: string) {
    const examples = new TimeoutTelemetryExamples();
    
    await examples.waitForElementWithTelemetry(
      selector,
      timeouts.uiInteraction
    );
  }

  /**
   * Example step definition with navigation and timeout tracking
   */
  async whenUserNavigatesToPage(url: string) {
    const examples = new TimeoutTelemetryExamples();
    
    await examples.navigateWithTelemetry(url);
  }
}

/**
 * Example: Custom timeout configuration based on telemetry data
 */
export class AdaptiveTimeoutManager {
  
  /**
   * Get adaptive timeout based on historical data
   */
  async getAdaptiveTimeout(operation: string, baseTimeout: number): Promise<number> {
    const analysis = timeoutTelemetry.analyzeTimeouts();
    const pattern = analysis.patterns.find(p => p.operation === operation);
    
    if (pattern) {
      // If operation has high timeout rate, increase timeout
      if (pattern.timeoutRate > 0.3) {
        return Math.min(baseTimeout * 1.5, baseTimeout * 2);
      }
      
      // If operation is consistently slow, increase timeout
      if (pattern.averageDuration > baseTimeout * 0.8) {
        return Math.min(baseTimeout * 1.2, baseTimeout * 1.5);
      }
    }
    
    return baseTimeout;
  }

  /**
   * Execute operation with adaptive timeout
   */
  async executeWithAdaptiveTimeout<T>(
    operation: () => Promise<T>,
    operationName: string,
    baseTimeout: number
  ): Promise<T> {
    const adaptiveTimeout = await this.getAdaptiveTimeout(operationName, baseTimeout);
    
    return await performanceMonitor.monitorWithTimeout(
      operation,
      operationName,
      adaptiveTimeout,
      'adaptive_timeout'
    );
  }
}

// Export examples for use in tests
export const timeoutExamples = new TimeoutTelemetryExamples();
export const timeoutSteps = new TimeoutTelemetryStepDefinitions();
export const adaptiveTimeoutManager = new AdaptiveTimeoutManager();
