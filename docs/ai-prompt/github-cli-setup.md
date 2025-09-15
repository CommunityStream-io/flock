# GitHub CLI Setup for Cursor Background Agents

## Context

Cursor's background agents need access to GitHub CLI (gh) to perform repository operations, create pull requests, manage issues, and interact with GitHub APIs. This setup ensures AI agents can seamlessly work with GitHub repositories without manual intervention.

## Environment

- **IDE**: Cursor with background agent capabilities
- **OS**: Windows 10/11, macOS, or Linux
- **GitHub CLI**: Latest version (2.0+)
- **Authentication**: Personal Access Token (PAT) or OAuth
- **Permissions**: Repository access, pull request creation, issue management

## Setup Requirements

### 1. Check Existing Access (First Priority)

Before making any changes, verify if GitHub CLI access is already configured:

```bash
# Check if GitHub CLI is installed and accessible
gh --version

# Check authentication status
gh auth status

# Test basic API access
gh api user

# Test repository access (replace with actual repo)
gh api repos/owner/repository-name

# Check if environment variables are set
echo "GITHUB_TOKEN: ${GITHUB_TOKEN:+SET}"
echo "GH_TOKEN: ${GH_TOKEN:+SET}"
echo "GITHUB_USERNAME: ${GITHUB_USERNAME:+SET}"

# Test Cursor agent integration
# Ask Cursor agent to run: gh repo list --limit 3
```

**If all checks pass, GitHub CLI is already configured and ready for use.**

### 2. GitHub CLI Installation (If Not Already Installed)

```bash
# Windows (via winget)
winget install GitHub.cli

# macOS (via Homebrew)
brew install gh

# Linux (Ubuntu/Debian)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### 3. Authentication Setup (If Not Already Authenticated)

```bash
# Interactive authentication (recommended)
gh auth login

# Or with token directly
gh auth login --with-token < token.txt

# Verify authentication
gh auth status
```

### 4. Environment Variables Configuration

Create or update your shell profile (`.bashrc`, `.zshrc`, `.profile`):

```bash
# GitHub CLI Configuration
export GITHUB_TOKEN=ghp_your_personal_access_token_here
export GH_TOKEN=ghp_your_personal_access_token_here
export GITHUB_USERNAME=your_github_username

# Optional: Set default repository
export GH_REPO=owner/repository-name

# Optional: Set default editor
export GH_EDITOR=code
```

### 5. Cursor Integration

#### Option A: Global Environment Variables
- Add environment variables to system settings
- Restart Cursor after configuration
- Variables will be available to all background agents

#### Option B: Project-Level Configuration
Create `.env` file in project root:

```bash
# .env (add to .gitignore)
GITHUB_TOKEN=ghp_your_token_here
GH_TOKEN=ghp_your_token_here
GITHUB_USERNAME=your_username
```

#### Option C: Cursor Settings
1. Open Cursor Settings (Ctrl/Cmd + ,)
2. Search for "terminal" or "environment"
3. Add environment variables in terminal settings
4. Restart Cursor

## Verification Steps

### 1. Test GitHub CLI Access

```bash
# In Cursor terminal
gh auth status
gh repo list --limit 5
gh issue list --limit 3
```

### 2. Test Repository Operations

```bash
# Create a test branch
gh repo clone owner/repo-name
cd repo-name
gh pr create --title "Test PR" --body "Testing GitHub CLI access"

# Check permissions
gh api user
gh api repos/owner/repo-name
```

### 3. Test Cursor Agent Integration

Create a test scenario:
1. Ask Cursor agent to create a new branch
2. Ask agent to create a pull request
3. Ask agent to check repository status
4. Verify operations complete without manual intervention

## Required GitHub Permissions

### Personal Access Token Scopes

Create a PAT with these scopes:
- `repo` - Full repository access
- `workflow` - Update GitHub Action workflows
- `write:packages` - Upload packages
- `delete:packages` - Delete packages
- `admin:org` - Organization administration (if needed)

### Repository Permissions

Ensure the token has access to:
- Read repository content
- Create and merge pull requests
- Manage issues and comments
- Access Actions workflows
- Read and write repository settings

## Troubleshooting

### Common Issues

#### 1. Authentication Failed
```bash
# Re-authenticate
gh auth logout
gh auth login

# Check token validity
gh api user
```

#### 2. Permission Denied
- Verify token has correct scopes
- Check repository permissions
- Ensure organization settings allow token access

#### 3. Environment Variables Not Loaded
```bash
# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc

# Check variables are set
echo $GITHUB_TOKEN
echo $GH_TOKEN
```

#### 4. Cursor Not Recognizing Variables
- Restart Cursor completely
- Check Cursor terminal settings
- Verify variables in Cursor's terminal environment

### Debug Commands

```bash
# Check GitHub CLI version
gh --version

# Verify authentication details
gh auth status --show-token

# Test API access
gh api graphql -f query='{ viewer { login } }'

# Check repository access
gh api repos/owner/repo-name --jq '.full_name'
```

## Security Best Practices

### 1. Token Management
- Use Personal Access Tokens, not passwords
- Set token expiration dates
- Rotate tokens regularly
- Use minimal required scopes

### 2. Environment Security
- Never commit tokens to version control
- Use environment variables, not hardcoded values
- Restrict token access to specific repositories
- Monitor token usage in GitHub settings

### 3. Access Control
- Limit token scopes to necessary permissions
- Use organization-level access controls
- Regularly audit token permissions
- Revoke unused or compromised tokens

## Success Criteria

The setup is successful when:

1. **Pre-check Passes**: Initial verification shows existing access is working
2. **Authentication**: `gh auth status` shows authenticated user
3. **Repository Access**: Can clone, read, and modify repositories
4. **Pull Request Creation**: Can create PRs without manual intervention
5. **Issue Management**: Can create, update, and close issues
6. **Cursor Integration**: Background agents can perform GitHub operations
7. **No Manual Prompts**: All operations complete automatically
8. **Security**: Token is properly secured and scoped

## Advanced Configuration

### 1. Multiple Accounts
```bash
# Add additional accounts
gh auth login --hostname github.enterprise.com
gh auth switch --user enterprise-user
```

### 2. Custom Configurations
```bash
# Set default browser
gh config set browser chrome

# Set default editor
gh config set editor code

# Set default protocol
gh config set git_protocol https
```

### 3. Automation Scripts
Create helper scripts for common operations:

```bash
#!/bin/bash
# scripts/github-setup.sh
gh auth status || gh auth login
gh repo set-default
echo "GitHub CLI ready for Cursor agents"
```

## Maintenance

### Regular Tasks
- Monitor token expiration dates
- Update GitHub CLI to latest version
- Review and rotate access tokens
- Audit repository permissions
- Test agent functionality after updates

### Monitoring
- Check GitHub CLI version compatibility
- Monitor token usage patterns
- Verify repository access remains intact
- Test critical workflows regularly

This setup ensures Cursor's background agents have seamless access to GitHub repositories while maintaining security best practices and providing comprehensive troubleshooting guidance.
