/// <reference types="@wdio/types" />
/// <reference types="@wdio/cucumber-framework" />
/// <reference types="expect-webdriverio" />

// Declare global WebdriverIO variables and expect function
declare global {
    const browser: WebdriverIO.Browser;
    const $: typeof browser.$;
    const $$: typeof browser.$$;
    
    // Declare expect function from expect-webdriverio
    const expect: any;
    
    // Extend WebdriverIO Element to include DOM properties
    namespace WebdriverIO {
        interface Element {
            files?: FileList;
            dispatchEvent?: (event: Event) => boolean;
            checkValidity?: () => boolean;
            validationMessage?: string;
        }
        
        // Extend ChainablePromiseElement to include filter method
        interface ChainablePromiseElement<T> {
            filter(fn: (element: T, index: number) => boolean | Promise<boolean>): ChainablePromiseElement<T>;
        }
    }
}

export {};
