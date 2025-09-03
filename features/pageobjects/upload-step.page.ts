import Page from './page';

class UploadStepPage extends Page {
    // Upload section elements
    public get uploadSection() {
        return $('.upload-section');
    }

    public get uploadHeading() {
        return $('.upload-section h2');
    }

    public get uploadDescription() {
        return $('.upload-section p');
    }

    public get chooseFilesButton() {
        return $('button[mat-raised-button]');
    }

    public get uploadIcon() {
        return $('button[mat-raised-button] mat-icon');
    }

    // File input (now hidden within the custom control)
    public get fileInput() {
        return $('input[type="file"]');
    }

    public get fileUploadForm() {
        return $('form[formGroup]');
    }

    public get instagramArchiveControl() {
        return $('input[formControlName="instagramArchive"]');
    }

    // Selected files section (now handled by the custom control)
    public get fileListSection() {
        return $('.file-list');
    }



    public get selectedFiles() {
        return $$('.file-selected');
    }

    public get deleteButtons() {
        return $$('.file-selected button[mat-icon-button]');
    }

    public get deleteIcons() {
        return $$('.file-selected mat-icon');
    }

    // Methods for file operations
    public async selectFile(filename: string) {
        const chooseButton = await this.chooseFilesButton;
        await chooseButton.click();
        
        // Simulate file selection by triggering the file input change event
        await browser.execute((inputSelector, fileName) => {
            const fileInput = document.querySelector(inputSelector);
            if (fileInput) {
                // Create a mock file object
                const mockFile = new File(['mock content'], fileName, { type: 'application/zip' });
                
                // Create a mock FileList
                const mockFileList = {
                    0: mockFile,
                    length: 1,
                    item: (index: number) => index === 0 ? mockFile : null,
                    [Symbol.iterator]: function* () {
                        yield mockFile;
                    }
                };
                
                // Trigger the change event with our mock file
                Object.defineProperty(fileInput, 'files', {
                    value: mockFileList,
                    writable: false
                });
                
                // Dispatch the change event
                const changeEvent = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(changeEvent);
            }
        }, 'input[type="file"]', filename);
        
        // Wait for the UI to update
        await browser.pause(200);
        console.log(`Simulated file selection: ${filename}`);
    }

    public async getSelectedFileName(index: number = 0) {
        const selectedFile = await this.selectedFiles[index];
        const text = await selectedFile.getText();
        // Extract filename from text (remove delete button text)
        return text.replace('delete', '').trim();
    }

    public async clickDeleteButton(index: number = 0) {
        const deleteButton = await this.deleteButtons[index];
        await deleteButton.click();
    }

    public async isFormValid() {
        try {
            // Check if file input has files
            const fileInput = await this.fileInput;
            const hasFiles = await fileInput.getValue() !== '';
            
            // Check if there are any validation errors visible
            const errorElements = await $$('.mat-error, .error-message');
            const hasErrors = errorElements.length > 0;
            
            return hasFiles && !hasErrors;
        } catch (error) {
            return false;
        }
    }

    public async hasFiles() {
        try {
            // Check if the file list section is visible, indicating files were selected
            const fileListSection = await this.fileListSection;
            const isDisplayed = await fileListSection.isDisplayed();
            return isDisplayed;
        } catch (error) {
            return false;
        }
    }

    public async getHeadingByText(headingText: string) {
        // Look for any heading element containing the specified text
        const headings = await $$(`h1, h2, h3, h4, h5, h6`);
        for (const heading of headings) {
            const text = await heading.getText();
            if (text.includes(headingText)) {
                return heading;
            }
        }
        return null;
    }

    // Navigation
    public async open() {
        await super.open('step/upload');
        await this.uploadSection.waitForDisplayed({ timeout: 10000 });
    }
}

export default new UploadStepPage();