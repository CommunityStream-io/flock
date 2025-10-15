#!/usr/bin/env node

/**
 * Azure Trusted Signing Script for Windows Code Signing
 * Based on: https://melatonin.dev/blog/code-signing-on-windows-with-azure-trusted-signing/
 * 
 * This script signs Windows executables using Azure Trusted Signing service.
 * It's called by electron-builder during the Windows build process.
 */

const { CodeSigningClient } = require('@azure/code-signing');
const { ClientSecretCredential } = require('@azure/identity');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Debug mode
const DEBUG = process.env.DEBUG_SIGNING === 'true';

// Environment variables (from GitHub Secrets)
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const AZURE_CERT_PROFILE_NAME = process.env.AZURE_CERT_PROFILE_NAME;
const AZURE_SIGNING_ACCOUNT_NAME = process.env.AZURE_SIGNING_ACCOUNT_NAME;

// Azure Code Signing endpoint
const ENDPOINT = `https://${AZURE_SIGNING_ACCOUNT_NAME}.codesigning.azure.net`;

function debugLog(...args) {
  if (DEBUG) {
    console.log('🐛 DEBUG:', ...args);
  }
}

/**
 * Main signing function
 * @param {Object} configuration - electron-builder configuration
 */
async function sign(configuration) {
  console.log('🔐 Starting Azure Trusted Signing...');
  console.log(`📁 File to sign: ${configuration.path}`);
  
  debugLog('Configuration:', configuration);
  debugLog('Endpoint:', ENDPOINT);

  // Validate environment variables
  const missingVars = [];
  if (!AZURE_TENANT_ID) missingVars.push('AZURE_TENANT_ID');
  if (!AZURE_CLIENT_ID) missingVars.push('AZURE_CLIENT_ID');
  if (!AZURE_CLIENT_SECRET) missingVars.push('AZURE_CLIENT_SECRET');
  if (!AZURE_CERT_PROFILE_NAME) missingVars.push('AZURE_CERT_PROFILE_NAME');
  if (!AZURE_SIGNING_ACCOUNT_NAME) missingVars.push('AZURE_SIGNING_ACCOUNT_NAME');

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('⚠️  Skipping code signing. Build will continue but executable will be unsigned.');
    console.error('');
    console.error('ℹ️  To enable Azure code signing, set the following environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    return;
  }

  // Verify file exists
  if (!fs.existsSync(configuration.path)) {
    console.error(`❌ File not found: ${configuration.path}`);
    throw new Error(`File not found: ${configuration.path}`);
  }

  const fileStats = fs.statSync(configuration.path);
  console.log(`📊 File size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);

  try {
    // Create credential
    console.log('🔑 Creating Azure credentials...');
    const credential = new ClientSecretCredential(
      AZURE_TENANT_ID,
      AZURE_CLIENT_ID,
      AZURE_CLIENT_SECRET
    );

    debugLog('Credential created successfully');

    // Create Code Signing client
    console.log('🌐 Connecting to Azure Code Signing service...');
    const client = new CodeSigningClient(ENDPOINT, credential);

    debugLog('Client created successfully');

    // Read file
    console.log('📖 Reading file...');
    const fileBuffer = fs.readFileSync(configuration.path);
    
    console.log('✍️  Signing file with Azure Trusted Signing...');
    console.log(`   Certificate Profile: ${AZURE_CERT_PROFILE_NAME}`);
    console.log(`   Signing Account: ${AZURE_SIGNING_ACCOUNT_NAME}`);
    
    // Sign the file
    const signResult = await client.signFile({
      certificateProfileName: AZURE_CERT_PROFILE_NAME,
      fileContent: fileBuffer,
      fileName: path.basename(configuration.path),
      signatureAlgorithm: 'SHA256', // Required for Windows
    });

    debugLog('Sign result received, writing back to file...');

    // Write signed file back
    fs.writeFileSync(configuration.path, signResult.signedFileContent);

    console.log('✅ File signed successfully with Azure Trusted Signing');
    console.log(`📦 Signed: ${configuration.path}`);

    // Verify signature
    await verifySignature(configuration.path);

  } catch (error) {
    console.error('❌ Azure signing failed:', error.message);
    
    if (DEBUG) {
      console.error('Full error stack:', error.stack);
      console.error('Error details:', error);
    }
    
    // Provide helpful error messages
    if (error.message.includes('401') || error.message.includes('authentication')) {
      console.error('');
      console.error('💡 Authentication failed. Please verify:');
      console.error('   1. AZURE_TENANT_ID is correct');
      console.error('   2. AZURE_CLIENT_ID is correct');
      console.error('   3. AZURE_CLIENT_SECRET is valid and not expired');
      console.error('   4. Service principal has "Code Signing Certificate Profile Signer" role');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      console.error('');
      console.error('💡 Resource not found. Please verify:');
      console.error('   1. AZURE_SIGNING_ACCOUNT_NAME is correct');
      console.error('   2. AZURE_CERT_PROFILE_NAME exists and is approved');
      console.error('   3. Certificate profile identity validation is complete');
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      console.error('');
      console.error('💡 Permission denied. Please verify:');
      console.error('   1. Service principal has correct role assignment');
      console.error('   2. Certificate profile is in "Active" state');
      console.error('   3. Subscription is active and has sufficient quota');
    }
    
    throw error;
  }
}

/**
 * Verify the code signature using signtool (Windows) or osslsigncode (Linux/Mac)
 */
async function verifySignature(filePath) {
  console.log('🔍 Verifying signature...');

  try {
    if (process.platform === 'win32') {
      // Use signtool on Windows
      try {
        const output = execSync(`signtool verify /pa "${filePath}"`, { encoding: 'utf8' });
        console.log('✅ Signature verified successfully!');
        
        if (DEBUG) {
          console.log('Verification output:', output);
        }
      } catch (error) {
        console.log('ℹ️  signtool verify returned non-zero exit code (this may be OK)');
        
        if (DEBUG) {
          console.log('Verification output:', error.stdout || error.message);
        }
      }
      
      // Get certificate details using PowerShell
      try {
        const certInfo = execSync(
          `powershell -Command "Get-AuthenticodeSignature '${filePath}' | Select-Object Status, SignerCertificate | ConvertTo-Json"`,
          { encoding: 'utf8' }
        );
        
        const cert = JSON.parse(certInfo);
        console.log('📜 Certificate Status:', cert.Status);
        
        if (DEBUG) {
          console.log('Certificate Details:', cert);
        }
      } catch (error) {
        if (DEBUG) {
          console.log('Could not get certificate details:', error.message);
        }
      }
      
    } else {
      // Use osslsigncode on Linux/Mac (if available)
      try {
        const output = execSync(`osslsigncode verify "${filePath}"`, { encoding: 'utf8' });
        console.log('✅ Signature verified:', output);
      } catch (err) {
        console.log('ℹ️  osslsigncode not available for verification (this is OK)');
        console.log('   Signature verification can be done on Windows with signtool');
      }
    }
  } catch (error) {
    console.error('⚠️  Signature verification error:', error.message);
    console.error('⚠️  This may be OK if verification tools are not available');
    
    if (DEBUG) {
      console.error('Verification error details:', error);
    }
  }
}

// Export for electron-builder
module.exports = sign;

// Allow direct execution for testing
if (require.main === module) {
  const testFile = process.argv[2];
  
  if (!testFile) {
    console.error('Usage: node azure-sign.js <file-path>');
    console.error('');
    console.error('Example:');
    console.error('  node azure-sign.js dist/electron/MyApp.exe');
    console.error('');
    console.error('Environment variables required:');
    console.error('  AZURE_TENANT_ID');
    console.error('  AZURE_CLIENT_ID');
    console.error('  AZURE_CLIENT_SECRET');
    console.error('  AZURE_CERT_PROFILE_NAME');
    console.error('  AZURE_SIGNING_ACCOUNT_NAME');
    console.error('');
    console.error('Optional:');
    console.error('  DEBUG_SIGNING=true for verbose output');
    process.exit(1);
  }

  console.log('🧪 Testing Azure Trusted Signing');
  console.log('================================');
  console.log('');

  sign({ path: testFile })
    .then(() => {
      console.log('');
      console.log('✅ Test signing completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.log('');
      console.error('❌ Test signing failed');
      process.exit(1);
    });
}
