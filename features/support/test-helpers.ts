/**
 * Test helpers for e2e file upload and validation testing
 */

export class TestFileHelper {
    /**
     * Creates a mock file for testing file upload functionality
     */
    static createMockFile(filename: string, content: string = 'test content', mimeType: string = 'application/zip'): File {
        return new File([content], filename, { type: mimeType });
    }

    /**
     * Creates a valid Instagram archive mock file
     */
    static createValidArchiveFile(filename: string = 'instagram-export.zip'): File {
        const mockArchiveContent = JSON.stringify({
            // Mock Instagram archive structure
            personal_information: {
                personal_information: {
                    username: 'testuser',
                    name: 'Test User'
                }
            },
            media: [],
            stories: []
        });
        return this.createMockFile(filename, mockArchiveContent, 'application/zip');
    }

    /**
     * Creates an invalid file for testing validation failure
     */
    static createInvalidFile(filename: string = 'invalid.txt'): File {
        return this.createMockFile(filename, 'invalid content', 'text/plain');
    }

    /**
     * Simulates file selection in a file input using browser execution
     */
    static async simulateFileSelection(fileInput: WebdriverIO.Element, file: File): Promise<void> {
        await browser.execute((input, mockFile) => {
            const dt = new DataTransfer();
            const testFile = new File([mockFile.content], mockFile.name, { type: mockFile.type });
            dt.items.add(testFile);
            input.files = dt.files;
            
            // Trigger change event to notify Angular of the file selection
            const changeEvent = new Event('change', { bubbles: true });
            input.dispatchEvent(changeEvent);
        }, fileInput, {
            content: file.stream(),
            name: file.name,
            type: file.type
        });
    }

    /**
     * Clears all file selections from file inputs
     */
    static async clearAllFileSelections(): Promise<void> {
        await browser.execute(() => {
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                (input as HTMLInputElement).value = '';
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    }

    /**
     * Waits for file validation to complete
     */
    static async waitForValidation(timeout: number = 3000): Promise<void> {
        await browser.pause(timeout);
        
        // Wait for any async validation processes
        await browser.waitUntil(
            async () => {
                // Check if any validation is in progress (this would depend on your implementation)
                const isValidating = await browser.execute(() => {
                    return !document.querySelector('.validating, .processing');
                });
                return isValidating;
            },
            { timeout, timeoutMsg: 'File validation did not complete in time' }
        );
    }

    /**
     * Gets the current file validation state from the DOM
     */
    static async getValidationState(): Promise<{ isValid: boolean; errors: string[]; success: boolean }> {
        return await browser.execute(() => {
            const errorElements = document.querySelectorAll('.error-message, .mat-error, .validation-error');
            const successElements = document.querySelectorAll('.success-message, .validation-success');
            
            const errors = Array.from(errorElements).map(el => el.textContent || '');
            const hasErrors = errors.length > 0;
            const hasSuccess = successElements.length > 0;
            
            return {
                isValid: !hasErrors && hasSuccess,
                errors: errors,
                success: hasSuccess
            };
        });
    }
}

export class NavigationTestHelper {
    /**
     * Safely attempts navigation and captures any guard responses
     */
    static async attemptNavigation(targetPath: string): Promise<{ success: boolean; currentPath: string; messages: string[] }> {
        const initialPath = await browser.getUrl();
        
        try {
            await browser.url(targetPath);
            await browser.pause(1000); // Allow guards to execute
            
            const finalPath = await browser.getUrl();
            const success = finalPath.includes(targetPath);
            
            // Capture any snackbar or error messages
            const messages = await browser.execute(() => {
                const snackbars = document.querySelectorAll('mat-snack-bar-container, .mat-mdc-snack-bar-container');
                const errors = document.querySelectorAll('.error-message, .mat-error');
                
                const allMessages = [];
                snackbars.forEach(snackbar => {
                    const message = snackbar.textContent?.trim();
                    if (message) allMessages.push(message);
                });
                
                errors.forEach(error => {
                    const message = error.textContent?.trim();
                    if (message) allMessages.push(message);
                });
                
                return allMessages;
            });
            
            return {
                success,
                currentPath: finalPath,
                messages
            };
        } catch (error) {
            return {
                success: false,
                currentPath: initialPath,
                messages: [error instanceof Error ? error.message : 'Navigation failed']
            };
        }
    }

    /**
     * Waits for and captures snackbar messages
     */
    static async captureSnackbarMessage(timeout: number = 5000): Promise<string | null> {
        try {
            const snackbar = await $('mat-snack-bar-container, .mat-mdc-snack-bar-container');
            await snackbar.waitForDisplayed({ timeout });
            
            const messageElement = await snackbar.$('.mat-mdc-snack-bar-label, simple-snack-bar');
            return await messageElement.getText();
        } catch {
            return null;
        }
    }

    /**
     * Checks if user is currently on a specific step
     */
    static async isOnStep(stepName: string): Promise<boolean> {
        const currentUrl = await browser.getUrl();
        return currentUrl.includes(`/step/${stepName}`);
    }

    /**
     * Extracts the current step name from the URL
     */
    static async getCurrentStep(): Promise<string | null> {
        const currentUrl = await browser.getUrl();
        const match = currentUrl.match(/\/step\/(\w+)/);
        return match ? match[1] : null;
    }
}

export class ValidationTestHelper {
    /**
     * Checks Angular form validation state
     */
    static async checkFormValidity(formSelector: string = 'form'): Promise<{ isValid: boolean; errors: string[] }> {
        return await browser.execute((selector) => {
            const form = document.querySelector(selector) as HTMLFormElement;
            if (!form) {
                return { isValid: false, errors: ['Form not found'] };
            }
            
            const isValid = form.checkValidity();
            const errors: string[] = [];
            
            // Collect validation errors from form controls
            const controls = form.querySelectorAll('input, select, textarea');
            controls.forEach(control => {
                if (!control.checkValidity()) {
                    const name = control.getAttribute('name') || control.getAttribute('formControlName') || 'unnamed field';
                    errors.push(`${name}: ${control.validationMessage}`);
                }
            });
            
            return { isValid, errors };
        }, formSelector);
    }

    /**
     * Waits for Angular component to be fully initialized
     */
    static async waitForAngularComponent(selector: string, timeout: number = 5000): Promise<void> {
        await browser.waitUntil(
            async () => {
                const element = await $(selector);
                const exists = await element.isExisting();
                if (!exists) return false;
                
                // Check if Angular has initialized the component
                const isInitialized = await browser.execute((sel) => {
                    const el = document.querySelector(sel);
                    if (!el) return false;
                    
                    // Check for Angular-specific attributes that indicate initialization
                    return el.hasAttribute('ng-version') || 
                           el.querySelector('[ng-version]') !== null ||
                           (window as any).ng?.getComponent?.(el) !== null;
                }, selector);
                
                return isInitialized;
            },
            { timeout, timeoutMsg: `Angular component ${selector} did not initialize in time` }
        );
    }
}

export class DebugHelper {
    /**
     * Captures current DOM state for debugging
     */
    static async capturePageState(): Promise<{ url: string; title: string; errors: string[]; warnings: string[] }> {
        const url = await browser.getUrl();
        const title = await browser.getTitle();
        
        const errors = await browser.execute(() => {
            const errorElements = document.querySelectorAll('.error, .mat-error, .error-message');
            return Array.from(errorElements).map(el => el.textContent?.trim() || '');
        });
        
        const warnings = await browser.execute(() => {
            const warningElements = document.querySelectorAll('.warning, .mat-warn, .warning-message');
            return Array.from(warningElements).map(el => el.textContent?.trim() || '');
        });
        
        return { url, title, errors, warnings };
    }

    /**
     * Logs current page state to console for debugging
     */
    static async logPageState(): Promise<void> {
        const state = await this.capturePageState();
        console.log('=== Page State Debug ===');
        console.log('URL:', state.url);
        console.log('Title:', state.title);
        console.log('Errors:', state.errors);
        console.log('Warnings:', state.warnings);
        console.log('========================');
    }
}