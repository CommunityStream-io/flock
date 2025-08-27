import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadControl } from './file-upload-control';

describe('FileUploadControl', () => {
  let component: FileUploadControl;
  let fixture: ComponentFixture<FileUploadControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadControl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploadControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
