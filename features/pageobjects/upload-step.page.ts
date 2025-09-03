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
        const fileInput = await this.fileInput;
        // Create a mock file for testing
        const file = new File(['test content'], filename, { type: 'application/zip' });
        await browser.execute((input, mockFile) => {
            // Create a DataTransfer object and file
            const dt = new DataTransfer();
            const file = new File([mockFile.content], mockFile.name, { type: mockFile.type });
            dt.items.add(file);
            (input as HTMLInputElement).files = dt.files;
            
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
            // Get the form element
            const form = document.querySelector('form[formGroup]') as any;
            if (!form) return false;
            
            // Get the Angular component instance to access the form
            const uploadComponent = document.querySelector('shared-upload') as any;
            if (!uploadComponent) return false;
            
            // Check if the form control has a value
            const formControl = uploadComponent.fileUploadForm?.get('instagramArchive');
            if (!formControl) return false;
            
            // Check if the form control is valid and has a value
            return formControl.valid && formControl.value !== null;
        });
    }

    public async hasFiles() {
        const fileInput = await this.fileInput;
        return await browser.execute((input) => {
            return (input as HTMLInputElement).files && (input as HTMLInputElement).files!.length > 0;
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