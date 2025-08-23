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

    // File input and form elements
    public get fileInput() {
        return $('input[type="file"]#fileInput');
    }

    public get fileUploadForm() {
        return $('form[formGroup]');
    }

    public get instagramArchiveControl() {
        return $('input[formControlName="instagramArchive"]');
    }

    // Selected files section
    public get fileListSection() {
        return $('.file-list');
    }

    public get selectedFilesHeading() {
        return $('.file-list h3');
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
        const fileInput = await this.fileInput;
        // Create a mock file for testing
        const file = new File(['test content'], filename, { type: 'application/zip' });
        await browser.execute((input, mockFile) => {
            // Create a DataTransfer object and file
            const dt = new DataTransfer();
            const file = new File([mockFile.content], mockFile.name, { type: mockFile.type });
            dt.items.add(file);
            input.files = dt.files;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }, fileInput, { content: 'test content', name: filename, type: 'application/zip' });
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
        return await browser.execute(() => {
            // Check the specific form control for instagramArchive
            const fileInput = document.querySelector('input[formControlName="instagramArchive"]') as HTMLInputElement;
            if (!fileInput) return false;
            
            // Check if the input has a file selected
            return fileInput.files && fileInput.files.length > 0;
        });
    }

    public async hasFiles() {
        const fileInput = await this.fileInput;
        return await browser.execute((input) => {
            return input.files && input.files.length > 0;
        }, fileInput);
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