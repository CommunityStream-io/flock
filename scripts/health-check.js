#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

const HEALTH_CHECK_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:4200';
const MAX_ATTEMPTS = 30; // 30 attempts (1 minute total)
const RETRY_INTERVAL = 2000; // 2 seconds between attempts

/**
 * Check if the http server is responding
 * @returns {Promise<boolean>}
 */
function checkHealth() {
    return new Promise((resolve, reject) => {
        const url = new URL(HEALTH_CHECK_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'GET',
            timeout: 10000 // Increased timeout to 10 seconds
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    // Check if the response contains Angular app indicators
                    const isAngularApp = data.includes('ng-version') || 
                                       data.includes('app-root') || 
                                       data.includes('angular') ||
                                       data.includes('main.js');
                    
                    if (isAngularApp) {
                        console.log(`✅ Health check passed: ${HEALTH_CHECK_URL} is responding with Angular app`);
                        resolve(true);
                    } else {
                        console.log(`⚠️ Health check failed: ${HEALTH_CHECK_URL} responded but not an Angular app`);
                        reject(new Error('Not an Angular application'));
                    }
                } else {
                    console.log(`⚠️ Health check failed: ${HEALTH_CHECK_URL} returned status ${res.statusCode}`);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.log(`⚠️ Health check failed: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log(`⚠️ Health check timeout: ${HEALTH_CHECK_URL} did not respond within 10 seconds`);
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

/**
 * Check if the Angular application is fully ready
 * @returns {Promise<boolean>}
 */
async function checkAngularReadiness() {
    return new Promise((resolve, reject) => {
        const url = new URL(HEALTH_CHECK_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'GET',
            timeout: 15000
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    // Check for Angular-specific indicators
                    const hasAngularIndicators = data.includes('ng-version') || 
                                               data.includes('app-root') || 
                                               data.includes('angular') ||
                                               data.includes('main.js') ||
                                               data.includes('polyfills.js');
                    
                    if (hasAngularIndicators) {
                        // Additional check: look for Angular bootstrap indicators or app-root element
                        const hasBootstrapIndicators = data.includes('bootstrap') ||
                                                      data.includes('platformBrowserDynamic') ||
                                                      data.includes('AppModule') ||
                                                      data.includes('<app-root') ||
                                                      data.includes('app-root>');
                        
                        if (hasBootstrapIndicators) {
                            console.log(`✅ Angular application is fully ready: ${HEALTH_CHECK_URL}`);
                            resolve(true);
                        } else {
                            // If we have Angular indicators but no explicit bootstrap, 
                            // check if the page has loaded enough content (not just a loading page)
                            const hasSubstantialContent = data.length > 1000 && 
                                                         (data.includes('</html>') || data.includes('</body>'));
                            
                            if (hasSubstantialContent) {
                                console.log(`✅ Angular application appears ready (content loaded): ${HEALTH_CHECK_URL}`);
                                resolve(true);
                            } else {
                                console.log(`⚠️ Angular app detected but may not be fully bootstrapped`);
                                reject(new Error('Angular app not fully bootstrapped'));
                            }
                        }
                    } else {
                        console.log(`⚠️ No Angular indicators found in response`);
                        reject(new Error('Not an Angular application'));
                    }
                } else {
                    console.log(`⚠️ Health check failed: ${HEALTH_CHECK_URL} returned status ${res.statusCode}`);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.log(`⚠️ Angular readiness check failed: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log(`⚠️ Angular readiness check timeout: ${HEALTH_CHECK_URL} did not respond within 15 seconds`);
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

async function waitForHealth() {
    console.log(`🔍 Starting comprehensive health check for ${HEALTH_CHECK_URL}`);
    
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            // First check basic HTTP health
            await checkHealth();
            
            // Then check Angular readiness
            await checkAngularReadiness();
            
            console.log(`✅ Application is fully ready after ${attempt} attempts`);
            process.exit(0);
        } catch (error) {
            console.log(`🔄 Health check attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}`);
            
            if (attempt === MAX_ATTEMPTS) {
                console.log(`❌ Health check failed after ${MAX_ATTEMPTS} attempts. Application may not be ready.`);
                process.exit(1);
            }
            
            console.log(`⏳ Waiting ${RETRY_INTERVAL}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
        }
    }
}

waitForHealth().catch((error) => {
    console.error(`❌ Health check failed: ${error.message}`);
    process.exit(1);
});
