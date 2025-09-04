import { TestBed } from '@angular/core/testing';
import { Instagram } from './instagram';

describe('Feature: Instagram service (BDD-Style)', () => {
  let service: Instagram;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Instagram);
  });

  it('Given service, When created, Then is truthy', () => {
    expect(service).toBeTruthy();
  });

  it('Given service, When validateExportStructure is called, Then it throws', () => {
    const call = () => service.validateExportStructure('/tmp');
    expect(call).toThrowError('Method not implemented.');
  });

  it('Given service, When processInstagramData is called, Then it throws', () => {
    const call = () => service.processInstagramData('/tmp');
    expect(call).toThrowError('Method not implemented.');
  });
});
