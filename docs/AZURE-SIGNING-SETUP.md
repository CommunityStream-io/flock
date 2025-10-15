# Azure Trusted Signing - Quick Setup Guide

This guide will help you get Azure Trusted Signing configured for the Flock Native application.

## Current Status

✅ GitHub Secrets configured  
✅ Certificate requested from Microsoft  
⏳ Waiting for Microsoft identity validation (3-7 business days)  
📋 Code integration ready (this PR)

## What This PR Includes

This PR adds complete Azure Trusted Signing integration:

1. **Signing Script** (`scripts/azure-sign.js`)
   - Handles authentication with Azure
   - Signs Windows executables during build
   - Includes detailed error handling and verification

2. **Build Configuration** (`package.json`)
   - Updated to use Azure signing script
   - Added required Azure dependencies

3. **CI/CD Integration** (`.github/workflows/release.yml`)
   - Passes Azure credentials to build process
   - Verifies signatures after build
   - Updates release notes about code signing

4. **Documentation**
   - Comprehensive integration plan
   - Script documentation
   - This setup guide

## Next Steps

### 1. Wait for Microsoft Approval

Your certificate profile needs to be approved by Microsoft:
- **Timeline**: 3-7 business days
- **Status Check**: Azure Portal → Code Signing → Certificate Profiles
- **What they verify**: Business identity via Microsoft Partner Network

### 2. Install Dependencies (after PR merge)

```bash
npm install
```

This will install the Azure signing packages:
- `@azure/code-signing`
- `@azure/identity`

### 3. Test Locally (optional)

Once certificate is approved, you can test signing locally:

```bash
# Set environment variables (don't commit these!)
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
export AZURE_CERT_PROFILE_NAME="your-profile-name"
export AZURE_SIGNING_ACCOUNT_NAME="your-account-name"

# Build Windows app (will sign automatically)
npm run pack:win
```

### 4. Create Test Release

Once testing looks good, create a test release:

```bash
# Create and push a test tag
git tag v0.5.11-test
git push origin v0.5.11-test
```

This will:
1. Trigger GitHub Actions workflow
2. Build Windows app with Azure signing
3. Create draft release with signed executable
4. Verify signature automatically

### 5. Verify Test Release

Download the test release and verify:

```powershell
# Download Flock-Native-0.5.11-test.exe

# Verify signature
signtool verify /pa Flock-Native-0.5.11-test.exe

# Check certificate details
Get-AuthenticodeSignature Flock-Native-0.5.11-test.exe | Format-List
```

Expected output:
```
Status          : Valid
SignerCertificate : CN=CommunityStream.io, ...
TimeStamperCertificate : CN=Microsoft, ...
```

### 6. Test SmartScreen Behavior

On a clean Windows machine:
1. Download the signed executable
2. Run it
3. Observe Windows SmartScreen

**Expected behavior with Azure Trusted Signing:**
- ✅ No SmartScreen warning, or
- ✅ Minimal warning with "CommunityStream.io" shown as verified publisher

**This is MUCH better than unsigned apps which show:**
- ❌ "Windows protected your PC"
- ❌ "Unknown publisher"
- ❌ Must click "More info" → "Run anyway"

### 7. Production Release

Once testing succeeds, create a production release:

```bash
git tag v0.6.0
git push origin v0.6.0
```

Or use the GitHub UI to create a new release.

## What If Microsoft Approval Is Delayed?

The code is designed to gracefully handle missing Azure credentials:

- **If Azure credentials are not set**: Build continues, executable is unsigned
- **If certificate is not approved yet**: Signing fails gracefully, build continues
- **Error messages**: Clear and actionable

So this PR is safe to merge even before certificate approval!

## Monitoring

### Check Signing Status in CI/CD

In GitHub Actions workflow runs:
1. Look for "🔐 Azure Trusted Signing enabled" message
2. Check "Verify build output and code signature" step
3. Should show "✅ Code signature is VALID"

### Azure Portal Monitoring

Track signing operations:
1. Azure Portal → Code Signing Account
2. Metrics → Signature Operations
3. Monitor costs (should be near-zero for our volume)

## Cost Expectations

- **Monthly cost**: ~$10-12
- **Annual cost**: ~$130-150
- **Compared to traditional certs**: Saves ~$1,870/year

Detailed cost analysis in `AZURE_TRUSTED_SIGNING_INTEGRATION.md`.

## Rollback

If anything goes wrong, signing can be disabled quickly:

1. **Quick disable** (emergency):
   ```bash
   # In package.json, change:
   "sign": "./scripts/azure-sign.js"
   # To:
   "sign": null
   ```

2. **Remove Azure secrets** (in GitHub Settings)
   - This will cause builds to skip signing automatically
   - Build will continue, executable will be unsigned

## Troubleshooting

### "Missing required environment variables"

Check GitHub Secrets are set correctly:
1. Repository Settings → Secrets and variables → Actions
2. Verify all 5 Azure secrets are present
3. Check for typos in secret names

### "Certificate profile not found"

Certificate profile may not be approved yet:
1. Check Azure Portal status
2. Wait for Microsoft approval (3-7 days)
3. Build will complete unsigned in the meantime

### Build succeeds but executable is unsigned

Check the build logs:
1. Look for "⚠️  Skipping code signing" message
2. Review the reason (missing vars, auth failure, etc.)
3. Fix the issue and retry

## Support Resources

- **Documentation**: See `AZURE_TRUSTED_SIGNING_INTEGRATION.md` for complete details
- **Script README**: See `scripts/README-AZURE-SIGNING.md` for script documentation
- **Azure Docs**: https://learn.microsoft.com/en-us/azure/code-signing/
- **Reference Blog**: https://melatonin.dev/blog/code-signing-on-windows-with-azure-trusted-signing/

## Questions?

Contact @straiforos for help with:
- Azure setup issues
- Certificate approval delays
- GitHub Actions configuration
- Testing and verification

---

**Ready to merge?** ✅ Yes! This PR is safe to merge before certificate approval.

**When to test?** ⏳ After Microsoft approves the certificate profile (3-7 days).

**Cost to implement?** 💰 ~$130/year (saves ~$1,870/year vs traditional certs).

---

Last Updated: 2025-10-15
