#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

const HEALTH_CHECK_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:4200';
const MAX_ATTEMPTS = 30; // 30 attempts
const RETRY_INTERVAL = 2000; // 2 seconds between attempts

function checkHealth() {
    return new Promise((resolve, reject) => {
        const url = new URL(HEALTH_CHECK_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ Health check passed: ${HEALTH_CHECK_URL} is responding`);
                resolve(true);
            } else {
                console.log(`⚠️ Health check failed: ${HEALTH_CHECK_URL} returned status ${res.statusCode}`);
                reject(new Error(`HTTP ${res.statusCode}`));
            }
        });

        req.on('error', (err) => {
            console.log(`⚠️ Health check failed: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log(`⚠️ Health check timeout: ${HEALTH_CHECK_URL} did not respond within 5 seconds`);
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

async function waitForHealth() {
    console.log(`🔍 Starting health check for ${HEALTH_CHECK_URL}`);
    
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            await checkHealth();
            console.log(`✅ Application is ready after ${attempt} attempts`);
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
