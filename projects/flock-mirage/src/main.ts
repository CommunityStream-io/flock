import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { inject } from '@angular/core';
import { Logger, LOGGER } from 'shared';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
