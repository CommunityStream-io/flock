/// <reference types="@wdio/types" />
/// <reference types="@wdio/cucumber-framework" />
/// <reference types="expect-webdriverio" />
/// <reference types="@wdio/globals" />

// Declare global WebdriverIO variables and expect function
declare global {
    // WebdriverIO globals
    const browser: WebdriverIO.Browser;
    const $: typeof browser.$;
    const $$: typeof browser.$$;
    
    // Expect function from expect-webdriverio
    const expect: any;
}

// Extend WebdriverIO types to include DOM properties
declare module 'webdriverio' {
    interface Element {
        files?: FileList;
        dispatchEvent?: (event: Event) => boolean;
        checkValidity?: () => boolean;
        validationMessage?: string;
    }
}

export {};
