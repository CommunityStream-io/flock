# Azure Trusted Signing Scripts

This directory contains scripts for signing Windows executables using Azure Trusted Signing.

## Overview

Azure Trusted Signing is a cloud-based code signing service that provides:
- Cost-effective code signing (~$130/year vs ~$2,000/year for traditional certificates)
- Instant SmartScreen reputation (no 6-12 month build-up period)
- CI/CD native integration (no USB tokens required)
- FIPS 140-2 Level 3 HSM security

## Files

- **`azure-sign.js`** - Main signing script called by electron-builder
- **`README-AZURE-SIGNING.md`** - This file

## Usage

### Automatic (via electron-builder)

The signing script is automatically called during Windows builds via the `package.json` configuration:

```json
{
  "build": {
    "win": {
      "sign": "./scripts/azure-sign.js"
    }
  }
}
```

When you run:
```bash
npm run pack:win
```

The script will automatically sign the Windows executable if Azure credentials are configured.

### Manual Testing

To test signing a specific file:

```bash
# Set environment variables
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
export AZURE_CERT_PROFILE_NAME="your-profile-name"
export AZURE_SIGNING_ACCOUNT_NAME="your-account-name"

# Sign a file
node scripts/azure-sign.js path/to/your-app.exe
```

### Debug Mode

Enable verbose logging:

```bash
export DEBUG_SIGNING=true
npm run pack:win
```

Or for manual testing:
```bash
DEBUG_SIGNING=true node scripts/azure-sign.js path/to/your-app.exe
```

## Required Environment Variables

The following environment variables must be set for signing to work:

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_TENANT_ID` | Azure AD tenant ID | `00000000-0000-0000-0000-000000000000` |
| `AZURE_CLIENT_ID` | Service principal client ID | `00000000-0000-0000-0000-000000000000` |
| `AZURE_CLIENT_SECRET` | Service principal secret | `your-secret-value` |
| `AZURE_CERT_PROFILE_NAME` | Certificate profile name | `flock-cert-profile` |
| `AZURE_SIGNING_ACCOUNT_NAME` | Code signing account name | `flock-signing-account` |

### GitHub Actions

These should be configured as GitHub Secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Add each variable as a repository secret
3. The `.github/workflows/release.yml` workflow will automatically use them

## How It Works

1. **electron-builder** calls `azure-sign.js` when building the Windows executable
2. **azure-sign.js**:
   - Validates environment variables
   - Authenticates with Azure using service principal
   - Reads the unsigned executable
   - Calls Azure Code Signing API
   - Writes the signed executable back
   - Verifies the signature (if signtool is available)

## Troubleshooting

### "Missing required environment variables"

**Problem:** One or more Azure environment variables are not set.

**Solution:** 
- For local builds: Set environment variables in your shell or `.env` file
- For CI/CD: Verify GitHub Secrets are configured correctly

### "Authentication failed"

**Problem:** Azure credentials are invalid or expired.

**Solution:**
1. Verify `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET`
2. Check service principal hasn't expired
3. Verify service principal has correct role assignment

### "Certificate profile not found"

**Problem:** The certificate profile doesn't exist or isn't approved.

**Solution:**
1. Verify `AZURE_CERT_PROFILE_NAME` matches exactly
2. Check Azure Portal: the profile should be in "Active" state
3. If recently created, Microsoft identity validation takes 3-7 business days

### "Permission denied"

**Problem:** Service principal doesn't have permission to sign.

**Solution:**
Assign the "Code Signing Certificate Profile Signer" role:

```bash
az role assignment create \
  --assignee <CLIENT_ID> \
  --role "Code Signing Certificate Profile Signer" \
  --scope "/subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP>/providers/Microsoft.CodeSigning/codeSigningAccounts/<ACCOUNT_NAME>/certificateProfiles/<PROFILE_NAME>"
```

### Build succeeds but executable is unsigned

**Problem:** Signing failed silently and build continued.

**Solution:**
1. Check build logs for "⚠️  Skipping code signing" message
2. Enable debug mode: `DEBUG_SIGNING=true npm run pack:win`
3. Review error messages in the console

## Verification

### On Windows

After signing, verify the signature:

```powershell
# Verify signature
signtool verify /pa "Flock-Native-0.5.10.exe"

# View certificate details
Get-AuthenticodeSignature "Flock-Native-0.5.10.exe" | Format-List
```

### On Linux/Mac

If `osslsigncode` is installed:

```bash
osslsigncode verify Flock-Native-0.5.10.exe
```

### Expected Output

A properly signed executable should show:
- ✅ Signature Status: Valid
- ✅ Signer: CommunityStream.io (or your organization name)
- ✅ Hash Algorithm: SHA256
- ✅ Timestamp present

## Cost Monitoring

Azure Trusted Signing costs are based on signature operations:
- First 5,000 signatures/month: **Free**
- Additional signatures: **$0.03 per signature**

For typical release cadence (1-2 builds per week), annual cost is ~$130-150.

To monitor costs:
1. Azure Portal → Cost Management + Billing
2. Filter by resource group: `flock-signing-rg`
3. View charges for "Code Signing" service

## Security Notes

1. **Never commit** Azure credentials to git
2. **Rotate** `AZURE_CLIENT_SECRET` every 90 days
3. **Audit** signing operations in Azure Portal
4. **Limit** service principal permissions to signing only
5. **Monitor** for unauthorized signing attempts

## References

- [Azure Trusted Signing Documentation](https://learn.microsoft.com/en-us/azure/code-signing/)
- [Melatonin Blog Post](https://melatonin.dev/blog/code-signing-on-windows-with-azure-trusted-signing/)
- [electron-builder Code Signing](https://www.electron.build/code-signing)
- [Main Integration Plan](../AZURE_TRUSTED_SIGNING_INTEGRATION.md)

## Support

For issues with Azure Trusted Signing:
1. Check troubleshooting section above
2. Review build logs with `DEBUG_SIGNING=true`
3. Check Azure Portal for service status
4. Contact @straiforos

---

Last Updated: 2025-10-15
