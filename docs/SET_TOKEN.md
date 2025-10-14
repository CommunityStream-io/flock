# How to Set PACKAGE_TOKEN in Git Bash

## Quick Commands

### Set token for current session:
```bash
export PACKAGE_TOKEN=ghp_your_token_here
```

### Verify it's set:
```bash
echo $PACKAGE_TOKEN
```

### Test it works with npm:
```bash
npm view @straiforos/instagramtobluesky version
```

---

## Permanent Setup (Optional)

If you want the token to persist across terminal sessions:

### Option 1: Add to ~/.bashrc (recommended)
```bash
# Edit your bash profile
nano ~/.bashrc

# Add this line at the end:
export PACKAGE_TOKEN=ghp_your_token_here

# Save (Ctrl+X, then Y, then Enter)

# Reload bashrc
source ~/.bashrc
```

### Option 2: Add to ~/.bash_profile
```bash
echo 'export PACKAGE_TOKEN=ghp_your_token_here' >> ~/.bash_profile
source ~/.bash_profile
```

### Option 3: Use .env file (for this project only)
```bash
# Create .env file in project root
echo "PACKAGE_TOKEN=ghp_your_token_here" > .env

# Docker Compose will load it automatically
```

---

## Security Warning

⚠️ **Never commit tokens to git!**

If using ~/.bashrc or ~/.bash_profile:
- Make sure these files aren't in a git repo
- Use a password manager to store the actual token
- Consider rotating tokens regularly

---

## Next Steps

Once you've set the token:

```bash
# 1. Verify token is set
echo $PACKAGE_TOKEN

# 2. Test npm can authenticate
npm view @straiforos/instagramtobluesky version

# 3. Run Docker build
npm run pack:win:docker
```


