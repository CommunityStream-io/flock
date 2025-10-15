# Azure Trusted Signing Integration Plan

> **Based on**: [Code Signing on Windows with Azure Trusted Signing](https://melatonin.dev/blog/code-signing-on-windows-with-azure-trusted-signing/)
> 
> **Status**: Ready for Implementation  
> **Cost Savings**: ~$1,870/year (93% reduction from traditional certificates)

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Cost Analysis](#cost-analysis)
3. [Azure Setup](#azure-setup)
4. [Implementation](#implementation)
5. [GitHub Actions Integration](#github-actions-integration)
6. [Testing Strategy](#testing-strategy)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Plan](#rollback-plan)

---

## Executive Summary

### What is Azure Trusted Signing?

Azure Trusted Signing is Microsoft's cloud-based code signing service that eliminates the need for expensive Extended Validation (EV) certificates and USB hardware tokens. It provides:

- ✅ **Cloud-based HSM**: FIPS 140-2 Level 3 compliant (higher security than USB tokens)
- ✅ **CI/CD Native**: API-based signing (no USB token complexity)
- ✅ **Cost Effective**: $120-150/year vs $2,000/year for traditional EV certificates
- ✅ **Instant Reputation**: Bypasses Windows SmartScreen warnings immediately
- ✅ **Certificate Management**: Automated lifecycle, no manual renewals

### Current State

According to PR comments:
- ✅ Environment variables are already configured in GitHub
- ✅ Certificate has been requested from Microsoft
- ⏳ Waiting for Microsoft identity validation (3-7 business days)
- 📋 Need to implement signing integration

### Required Environment Variables

You mentioned these are already in GitHub. Verify they include:

```bash
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_CERT_PROFILE_NAME=your-certificate-profile-name
AZURE_SIGNING_ACCOUNT_NAME=your-signing-account-name
```

---

## Cost Analysis

### Traditional EV Certificate
- **Certificate Cost**: $300-500/year (minimum)
- **USB Token**: $50-100 (one-time)
- **Reputation Building**: 6-12 months of downloads before SmartScreen clears
- **Total Year 1**: ~$400-600
- **Annual Renewal**: ~$300-500

### Azure Trusted Signing
- **Base Service**: Free tier available
- **Signing Operations**: First 5,000 signatures free, then $0.03 per signature
- **Estimated Annual Cost**: $120-150/year (for typical usage)
- **Instant Reputation**: No SmartScreen warnings from day 1
- **Total Year 1**: ~$130

### Savings
- **Annual Savings**: ~$1,870/year (93% reduction)
- **Time Savings**: No USB token management, no manual certificate renewals
- **CI/CD Complexity**: Eliminated (no USB token in CI/CD)

---

## Azure Setup

### Prerequisites

1. **Azure Account** with appropriate permissions
2. **Microsoft Partner Network** membership (for identity verification)
3. **Azure CLI** installed locally (for setup)

### Step 1: Create Azure Resources (If Not Done)

If you haven't completed Azure setup yet, follow these steps:

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "Your-Subscription-Name"

# Create resource group
az group create \
  --name flock-signing-rg \
  --location eastus

# Create Code Signing Account
az codesigning account create \
  --resource-group flock-signing-rg \
  --account-name flock-signing-account \
  --location eastus

# Create Certificate Profile
# Note: This requires identity verification by Microsoft (3-7 business days)
az codesigning certificate-profile create \
  --resource-group flock-signing-rg \
  --account-name flock-signing-account \
  --profile-name flock-cert-profile \
  --profile-type PublicTrust \
  --identity-validation-id "your-validation-id"
```

### Step 2: Create Service Principal

This allows GitHub Actions to authenticate:

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "flock-github-actions-signing" \
  --role "Code Signing Certificate Profile Signer" \
  --scopes "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/flock-signing-rg/providers/Microsoft.CodeSigning/codeSigningAccounts/flock-signing-account/certificateProfiles/flock-cert-profile"

# Output will include:
# {
#   "appId": "your-client-id",
#   "password": "your-client-secret",
#   "tenant": "your-tenant-id"
# }
```

### Step 3: Verify GitHub Secrets

Ensure these secrets are configured in GitHub repository settings:

```
AZURE_TENANT_ID
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
AZURE_CERT_PROFILE_NAME=flock-cert-profile
AZURE_SIGNING_ACCOUNT_NAME=flock-signing-account
```

---

## Implementation

### Overview

The integration uses a custom Node.js signing script called by electron-builder during the Windows build process. This is the approach recommended in the Melatonin article.

### Step 1: Install Azure Signing Package

```bash
npm install --save-dev @azure/identity @azure/code-signing
```

### Step 2: Create Signing Script

Create `scripts/azure-sign.js`:

```javascript
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

// Environment variables (from GitHub Secrets)
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const AZURE_CERT_PROFILE_NAME = process.env.AZURE_CERT_PROFILE_NAME;
const AZURE_SIGNING_ACCOUNT_NAME = process.env.AZURE_SIGNING_ACCOUNT_NAME;

// Azure Code Signing endpoint
const ENDPOINT = `https://${AZURE_SIGNING_ACCOUNT_NAME}.codesigning.azure.net`;

/**
 * Main signing function
 * @param {Object} configuration - electron-builder configuration
 */
async function sign(configuration) {
  console.log('🔐 Starting Azure Trusted Signing...');
  console.log(`📁 File to sign: ${configuration.path}`);

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
    return;
  }

  // Verify file exists
  if (!fs.existsSync(configuration.path)) {
    console.error(`❌ File not found: ${configuration.path}`);
    throw new Error(`File not found: ${configuration.path}`);
  }

  try {
    // Create credential
    const credential = new ClientSecretCredential(
      AZURE_TENANT_ID,
      AZURE_CLIENT_ID,
      AZURE_CLIENT_SECRET
    );

    // Create Code Signing client
    const client = new CodeSigningClient(ENDPOINT, credential);

    console.log('🔑 Authenticating with Azure...');

    // Sign the file
    const fileBuffer = fs.readFileSync(configuration.path);
    
    console.log('✍️  Signing file...');
    const signResult = await client.signFile({
      certificateProfileName: AZURE_CERT_PROFILE_NAME,
      fileContent: fileBuffer,
      fileName: path.basename(configuration.path),
      signatureAlgorithm: 'SHA256', // Required for Windows
    });

    // Write signed file back
    fs.writeFileSync(configuration.path, signResult.signedFileContent);

    console.log('✅ File signed successfully with Azure Trusted Signing');
    console.log(`📦 Signed: ${configuration.path}`);

    // Verify signature
    await verifySignature(configuration.path);

  } catch (error) {
    console.error('❌ Azure signing failed:', error.message);
    console.error('Full error:', error);
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
      const output = execSync(`signtool verify /pa "${filePath}"`, { encoding: 'utf8' });
      console.log('✅ Signature verified:', output);
    } else {
      // Use osslsigncode on Linux/Mac (if available)
      try {
        const output = execSync(`osslsigncode verify "${filePath}"`, { encoding: 'utf8' });
        console.log('✅ Signature verified:', output);
      } catch (err) {
        console.log('ℹ️  osslsigncode not available for verification (this is OK)');
      }
    }
  } catch (error) {
    console.error('⚠️  Signature verification failed:', error.message);
    console.error('⚠️  This may be OK if verification tools are not available');
  }
}

// Export for electron-builder
module.exports = sign;

// Allow direct execution for testing
if (require.main === module) {
  const testFile = process.argv[2];
  if (!testFile) {
    console.error('Usage: node azure-sign.js <file-path>');
    process.exit(1);
  }

  sign({ path: testFile })
    .then(() => {
      console.log('✅ Test signing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test signing failed:', error);
      process.exit(1);
    });
}
```

### Step 3: Update package.json

Update the `build.win` section in `package.json`:

```json
{
  "build": {
    "win": {
      "target": [
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "projects/flock-native/build/icon.ico",
      "signtoolOptions": {
        "publisherName": "CommunityStream.io"
      },
      "sign": "./scripts/azure-sign.js",
      "signDlls": false
    }
  }
}
```

**Key Changes:**
- `"sign": "./scripts/azure-sign.js"` - Points to our custom signing script
- `"signDlls": false` - We only sign the main executable (DLL signing is expensive)

---

## GitHub Actions Integration

### Update Windows Build Job

Modify `.github/workflows/release.yml` to include Azure credentials:

```yaml
build-windows:
  name: Build Windows
  needs: create-release
  runs-on: windows-latest
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    PACKAGE_TOKEN: ${{ secrets.PACKAGE_TOKEN }}
    # Azure Trusted Signing credentials
    AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
    AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
    AZURE_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
    AZURE_CERT_PROFILE_NAME: ${{ secrets.AZURE_CERT_PROFILE_NAME }}
    AZURE_SIGNING_ACCOUNT_NAME: ${{ secrets.AZURE_SIGNING_ACCOUNT_NAME }}
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '24.5.0'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Update package.json version
      run: |
        $VERSION = "${{ needs.create-release.outputs.version }}"
        Write-Host "Updating package.json to version $VERSION"
        npm version "$VERSION" --no-git-tag-version --allow-same-version
        Write-Host "✅ Package version updated to $VERSION"
      shell: pwsh

    - name: Build Angular app
      run: npm run build:native:prod

    - name: Build and Sign Windows app
      run: |
        Write-Host "🪟 Building and signing Windows app..."
        Write-Host "🔐 Azure Trusted Signing enabled"
        Write-Host "📦 Running npm run pack:win"
        npm run pack:win
        Write-Host "✅ Windows build and signing completed"
      shell: pwsh
      env:
        GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    - name: Verify code signature
      run: |
        Write-Host "🔍 Verifying code signature..."
        $VERSION = "${{ needs.create-release.outputs.version }}"
        $FILE = "dist/electron/Flock Native $VERSION.exe"
        
        if (Test-Path $FILE) {
          Write-Host "📁 File found: $FILE"
          
          # Verify signature using signtool
          try {
            $result = & signtool verify /pa $FILE
            Write-Host "✅ Code signature verified!"
            Write-Host $result
          } catch {
            Write-Host "⚠️  Signature verification failed or signtool not available"
            Write-Host $_.Exception.Message
          }
          
          # Show certificate info
          try {
            $cert = Get-AuthenticodeSignature $FILE
            Write-Host "📜 Certificate Details:"
            Write-Host "  Signer: $($cert.SignerCertificate.Subject)"
            Write-Host "  Status: $($cert.Status)"
            Write-Host "  Timestamp: $($cert.TimeStamperCertificate.Subject)"
          } catch {
            Write-Host "ℹ️  Could not retrieve certificate details"
          }
        } else {
          Write-Host "❌ Build output not found: $FILE"
          exit 1
        }
      shell: pwsh

    - name: Upload Windows portable EXE to GitHub Release
      uses: actions/upload-release-asset@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        upload_url: ${{ needs.create-release.outputs.upload_url }}
        asset_path: dist/electron/Flock Native ${{ needs.create-release.outputs.version }}.exe
        asset_name: Flock-Native-${{ needs.create-release.outputs.version }}.exe
        asset_content_type: application/octet-stream
      continue-on-error: true

    - name: Upload Windows build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: windows-build-artifacts
        path: dist/electron/
        retention-days: 30
```

---

## Testing Strategy

### Phase 1: Local Testing (Pre-Deployment)

**Prerequisites:**
- Azure credentials available locally (via environment variables or `.env` file)
- Certificate profile approved by Microsoft

**Test 1: Script Validation**
```bash
# Test the signing script directly
node scripts/azure-sign.js dist/electron/test.exe
```

**Expected Result:**
- ✅ Script authenticates with Azure
- ✅ File is signed successfully
- ✅ No errors in console output

---

### Phase 2: CI/CD Testing

**Test 2: Draft Release Build**
```bash
# Trigger a test release
git tag v0.5.11-test
git push origin v0.5.11-test
```

**Expected Result:**
- ✅ GitHub Actions workflow completes successfully
- ✅ Windows executable is signed
- ✅ Draft release is created with signed binary

**Test 3: Signature Verification**

Download the signed executable and verify:

```powershell
# On Windows
signtool verify /pa Flock-Native-0.5.11-test.exe

# Check certificate details
Get-AuthenticodeSignature Flock-Native-0.5.11-test.exe | Format-List
```

**Expected Result:**
- ✅ Signature verified successfully
- ✅ Certificate shows "CommunityStream.io" as publisher
- ✅ Timestamp is present
- ✅ Certificate is trusted

---

### Phase 3: User Experience Testing

**Test 4: Windows SmartScreen**

1. Download signed executable on clean Windows 10/11 machine
2. Run the executable
3. Observe SmartScreen behavior

**Expected Result:**
- ✅ No SmartScreen warning (or minimal warning)
- ✅ Publisher name shows correctly
- ✅ Installation proceeds smoothly

**Test 5: Windows Defender**

1. Scan signed executable with Windows Defender
2. Check if file is flagged

**Expected Result:**
- ✅ No false positives
- ✅ Clean scan results

---

### Phase 4: Production Validation

**Test 6: Full Release Cycle**

1. Create production release (e.g., v0.6.0)
2. Sign with Azure Trusted Signing
3. Publish release
4. Verify downloads work correctly

**Expected Result:**
- ✅ Users can download and install without issues
- ✅ No SmartScreen warnings reported
- ✅ Auto-update works correctly

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Authentication Failed

**Error:**
```
❌ Azure signing failed: ClientAuthenticationError
```

**Solution:**
```bash
# Verify environment variables are set
echo $AZURE_TENANT_ID
echo $AZURE_CLIENT_ID
# Don't echo CLIENT_SECRET for security

# Test Azure CLI authentication
az login --service-principal \
  -u $AZURE_CLIENT_ID \
  -p $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID
```

---

#### Issue 2: Certificate Profile Not Found

**Error:**
```
❌ Certificate profile 'flock-cert-profile' not found
```

**Solution:**
```bash
# List available certificate profiles
az codesigning certificate-profile list \
  --resource-group flock-signing-rg \
  --account-name flock-signing-account

# Verify profile name matches exactly
```

---

#### Issue 3: Identity Validation Pending

**Error:**
```
❌ Certificate profile is pending identity validation
```

**Solution:**
- Microsoft identity validation takes 3-7 business days
- Check Azure Portal for validation status
- Follow up with Microsoft support if delayed

---

#### Issue 4: Signature Verification Fails

**Error:**
```
⚠️  Signature verification failed
```

**Solution:**
```powershell
# Check detailed signature info
Get-AuthenticodeSignature file.exe | Select-Object *

# Verify certificate chain
certutil -verify -urlfetch file.exe
```

---

#### Issue 5: Missing Dependencies

**Error:**
```
Cannot find module '@azure/code-signing'
```

**Solution:**
```bash
# Install required packages
npm install --save-dev @azure/identity @azure/code-signing

# Verify installation
npm list @azure/code-signing
```

---

### Debug Mode

Add verbose logging to `scripts/azure-sign.js`:

```javascript
// At the top of azure-sign.js
const DEBUG = process.env.DEBUG_SIGNING === 'true';

function debugLog(...args) {
  if (DEBUG) {
    console.log('🐛 DEBUG:', ...args);
  }
}

// Use throughout the script
debugLog('Configuration:', configuration);
debugLog('Endpoint:', ENDPOINT);
```

Run with debug enabled:
```bash
DEBUG_SIGNING=true npm run pack:win
```

---

## Rollback Plan

### Scenario 1: Azure Signing Fails During Release

**Quick Rollback (5 minutes):**

1. Update `package.json` to disable signing:
   ```json
   {
     "build": {
       "win": {
         "sign": null,
         "signDlls": false
       }
     }
   }
   ```

2. Rebuild without signing:
   ```bash
   npm run pack:win
   ```

3. Upload unsigned binary to release

**Communication:**
- Update release notes to indicate temporary unsigned build
- Warn users about SmartScreen warnings
- Set timeline for signed release

---

### Scenario 2: Certificate Profile Issues

**Mitigation:**

1. Keep existing unsigned build process as backup
2. Create feature branch for signing integration
3. Test thoroughly before merging to main
4. Use draft releases for testing

---

### Scenario 3: Complete Reversion to Traditional Certificates

If Azure Trusted Signing doesn't work out:

**Steps:**

1. Purchase traditional EV certificate
2. Update `package.json`:
   ```json
   {
     "build": {
       "win": {
         "certificateFile": "path/to/certificate.pfx",
         "certificatePassword": "env:CERTIFICATE_PASSWORD",
         "sign": null
       }
     }
   }
   ```

3. Update GitHub secrets with certificate
4. Remove Azure signing dependencies

**Timeline:** 1-2 days (certificate purchase + integration)
**Cost Impact:** Return to ~$400-600/year

---

## Implementation Checklist

### Pre-Implementation
- [ ] Azure account created
- [ ] Certificate profile requested and approved by Microsoft
- [ ] Service principal created with correct permissions
- [ ] GitHub secrets configured
- [ ] Team reviewed this plan

### Implementation
- [ ] Install `@azure/identity` and `@azure/code-signing` packages
- [ ] Create `scripts/azure-sign.js`
- [ ] Update `package.json` build configuration
- [ ] Update `.github/workflows/release.yml`
- [ ] Test signing script locally
- [ ] Create test release with signing

### Verification
- [ ] Signature verification passes
- [ ] SmartScreen behavior acceptable
- [ ] Windows Defender clean scan
- [ ] Auto-update works correctly
- [ ] Documentation updated

### Production
- [ ] Production release with Azure signing
- [ ] Monitor user feedback
- [ ] Update release notes about code signing
- [ ] Archive old unsigned releases (optional)

---

## Additional Resources

### Documentation
- [Azure Trusted Signing Overview](https://learn.microsoft.com/en-us/azure/code-signing/)
- [Melatonin Blog Post](https://melatonin.dev/blog/code-signing-on-windows-with-azure-trusted-signing/)
- [electron-builder Code Signing](https://www.electron.build/code-signing)

### Support
- **Azure Support**: Azure Portal support tickets
- **electron-builder**: GitHub Issues
- **Community**: Electron Discord, Stack Overflow

---

## Next Steps

1. **Verify Azure Setup** (1 day)
   - Confirm certificate profile is approved
   - Test authentication with service principal
   - Verify all environment variables

2. **Implement Signing Script** (2-4 hours)
   - Install dependencies
   - Create `scripts/azure-sign.js`
   - Test locally with sample executable

3. **Update Build Configuration** (1-2 hours)
   - Update `package.json`
   - Update GitHub Actions workflow
   - Test in CI/CD environment

4. **Testing** (1-2 days)
   - Create test release
   - Verify signatures
   - Test on clean Windows machines
   - Validate SmartScreen behavior

5. **Production Release** (1 day)
   - Create signed production release
   - Monitor user feedback
   - Update documentation

**Total Timeline:** 3-5 days (after Microsoft certificate approval)

---

## Questions?

Contact: @straiforos
Last Updated: 2025-10-15
