# 🌿 All-Branch Support Documentation

## ✅ **What's New**

Your Jekyll documentation site now supports **ALL BRANCHES** automatically! No more hardcoded branch lists - the system dynamically detects and deploys documentation for any branch you push.

### **🚀 Dynamic Branch Support**

```bash
# ANY branch will get its own documentation site!
git checkout -b feature/auth-improvements    →  /flock-branch-feature-auth-improvements/
git checkout -b chore/update-deps           →  /flock-branch-chore-update-deps/
git checkout -b hotfix/critical-bug         →  /flock-branch-hotfix-critical-bug/
git checkout -b epic/dashboard-redesign     →  /flock-branch-epic-dashboard-redesign/

# Special branches get friendly URLs
git checkout -b main       →  /flock/                    (GitHub Pages root)
git checkout -b develop    →  /flock-develop/
git checkout -b staging    →  /flock-staging/
```

## 🏗️ **Architecture Overview**

### **Dynamic Branch Detection**
The workflow automatically:
1. **Detects any pushed branch** using `github.ref_name`
2. **Creates URL-safe slug** (converts special characters to hyphens)  
3. **Determines deployment path** based on branch type
4. **Configures Jekyll site** with branch-specific settings
5. **Deploys to unique subdirectory** on GitHub Pages

### **Branch URL Mapping**
```
Branch Name                    →    Documentation URL
main                          →    https://communitystream-io.github.io/flock/
develop                       →    https://communitystream-io.github.io/flock-develop/
staging                       →    https://communitystream-io.github.io/flock-staging/
feature/user-authentication   →    https://communitystream-io.github.io/flock-branch-feature-user-authentication/
chore/update-dependencies     →    https://communitystream-io.github.io/flock-branch-chore-update-dependencies/
hotfix/security-patch         →    https://communitystream-io.github.io/flock-branch-hotfix-security-patch/
```

## 🎯 **Key Features**

### **🌿 Branch Switcher UI**
Every documentation site includes an interactive branch switcher that shows:
- **Current branch** with environment badge (preview, development, production)
- **Main branches** (main, develop, staging) with quick access
- **Feature branches** dynamically loaded from branch registry
- **Tool links** (Allure, Coverage) for current branch
- **All branches index** for comprehensive branch overview

### **📋 Branch Registry**
The system maintains a branch registry at `/_branches/` with:
- **Individual branch metadata** (`/_branches/{branch-slug}.json`)
- **Branch index page** (`/_branches/index.html`) 
- **Automatic cleanup** when branches are deleted

### **🧹 Automatic Cleanup**
- **Branch deletion detection** removes deployed sites automatically
- **Artifact cleanup** removes old build artifacts after 7 days  
- **Registry maintenance** keeps branch index current

### **🔍 PR Preview Comments**
Pull requests automatically get preview comments showing:
- **Branch documentation URL** for the feature branch
- **Tool URLs** (Allure, Coverage, Badges) specific to that branch
- **Update on every push** to keep information current

## 🚀 **How It Works**

### **1. Workflow Trigger** 
```yaml
on:
  push:
    branches: [ "**" ]  # ALL BRANCHES!
    paths:
      - 'docs/**'
      - '_*/**'
      - '*.md'
      - '_config.yml'
      - 'assets/**'
  delete:
    # Cleanup when branches are deleted
```

### **2. Dynamic Branch Detection**
```bash
# Branch name: feature/auth-improvements  
BRANCH_NAME="feature/auth-improvements"

# URL-safe slug: feature-auth-improvements
BRANCH_SLUG=$(echo "$BRANCH_NAME" | sed 's/[^a-zA-Z0-9-]/-/g')

# Deployment path: /flock-branch-feature-auth-improvements
BASE_PATH="/flock-branch-$BRANCH_SLUG"

# Environment: preview (for feature branches)
ENVIRONMENT="preview"
```

### **3. Jekyll Configuration**
Each branch gets a custom Jekyll configuration:
```yaml
baseurl: "/flock-branch-feature-auth-improvements"
branch: "feature/auth-improvements"  
branch_slug: "feature-auth-improvements"
environment: "preview"

branch_info:
  name: "feature/auth-improvements"
  slug: "feature-auth-improvements"  
  environment: "preview"
  is_preview: true

tools:
  allure:
    branches:
      - name: "feature/auth-improvements"
        url: "https://communitystream-io.github.io/flock-branch-feature-auth-improvements/allure/"
```

### **4. GitHub Pages Deployment**
```bash
# Main branch deploys to root
main → GitHub Pages environment (official)

# All other branches deploy to subdirectories  
feature/auth → gh-pages/flock-branch-feature-auth/
develop      → gh-pages/flock-develop/
staging      → gh-pages/flock-staging/
```

## 📋 **Branch Types & Environments**

### **Production Branches**
```bash
main → Environment: production, URL: /flock/
```
- Deploys to GitHub Pages root environment
- Full GitHub Pages integration
- Production-ready documentation

### **Development Branches**  
```bash
develop → Environment: development, URL: /flock-develop/
staging → Environment: staging, URL: /flock-staging/
```
- Special staging/development treatment
- Friendly URLs without "branch" prefix
- Development/staging environment badges

### **Feature/Topic Branches**
```bash
feature/* → Environment: preview, URL: /flock-branch-feature-*/
chore/*   → Environment: preview, URL: /flock-branch-chore-*/
hotfix/*  → Environment: preview, URL: /flock-branch-hotfix-*/
bugfix/*  → Environment: preview, URL: /flock-branch-bugfix-*/
epic/*    → Environment: preview, URL: /flock-branch-epic-*/
```
- All get "preview" environment
- Includes branch type in URL
- Preview environment badge in UI

## 🛠️ **Tool Integration Per Branch**

Each branch maintains its own tool endpoints:

### **Allure Reports**
```bash
main     → https://communitystream-io.github.io/flock/allure/
develop  → https://communitystream-io.github.io/flock-develop/allure/  
feature  → https://communitystream-io.github.io/flock-branch-feature-*/allure/
```

### **Test Badges**
```bash
main     → https://communitystream-io.github.io/flock/badges/
develop  → https://communitystream-io.github.io/flock-develop/badges/
feature  → https://communitystream-io.github.io/flock-branch-feature-*/badges/
```

### **Code Coverage**
```bash
main     → https://codecov.io/github/CommunityStream-io/flock
develop  → https://codecov.io/github/CommunityStream-io/flock/branch/develop
feature  → https://codecov.io/github/CommunityStream-io/flock/branch/feature/*
```

## 🔍 **Branch Discovery**

### **Branch Switcher**
Located in the top navigation, shows:
- **Current branch** with environment indicator
- **Main branches** (main, develop, staging)
- **Recent feature branches** (up to 5 most recent)
- **Quick tool access** for current branch

### **Branch Registry** 
Available at `https://communitystream-io.github.io/_branches/`:
- **Complete branch list** with metadata
- **Last updated timestamps**
- **Direct links** to each branch's documentation
- **Environment information**

### **PR Comments**
Every pull request automatically gets a comment with:
```markdown
## 🦅 Documentation Preview

📖 **Branch**: `feature/auth-improvements`  
🔗 **Preview URL**: https://communitystream-io.github.io/flock-branch-feature-auth-improvements/

### Available Tools:
- 📊 **Allure Reports**: https://communitystream-io.github.io/flock-branch-feature-auth-improvements/allure/
- 🏆 **Test Badges**: https://communitystream-io.github.io/flock-branch-feature-auth-improvements/badges/  
- 📈 **Coverage**: https://codecov.io/github/CommunityStream-io/flock/branch/feature/auth-improvements

*This comment is automatically updated on each push.*
```

## 🧹 **Cleanup & Maintenance**

### **Automatic Branch Cleanup**
When you delete a branch:
```bash
git branch -d feature/auth-improvements
git push origin --delete feature/auth-improvements
```

The workflow automatically:
1. **Detects branch deletion** via GitHub webhook
2. **Removes deployment directory** (`gh-pages/flock-branch-feature-auth-improvements/`)
3. **Updates branch registry** (removes from `/_branches/`)
4. **Cleans up metadata** files

### **Artifact Management**
- **Build artifacts** are kept for 7 days
- **Old artifacts** are automatically cleaned up
- **Site deployments** persist until branch deletion

### **Storage Optimization**
- **Shared assets** are reused across branches
- **Tool reports** are preserved when updating documentation
- **Incremental deployments** only update changed content

## 📊 **Branch Metadata**

Each branch deployment includes rich metadata:

### **BRANCH.json**
```json
{
  "branch": "feature/auth-improvements",
  "branch_slug": "feature-auth-improvements", 
  "base_path": "/flock-branch-feature-auth-improvements",
  "environment": "preview",
  "is_main_branch": false,
  "build_time": "2024-01-15T10:30:00Z",
  "commit_sha": "abc123...",
  "run_id": "1234567890",
  "repository": "CommunityStream-io/flock"
}
```

### **branch-info.json**
```json
{
  "branch_name": "feature/auth-improvements",
  "branch_slug": "feature-auth-improvements",
  "subdirectory": "flock-branch-feature-auth-improvements", 
  "environment": "preview",
  "deploy_time": "2024-01-15T10:35:00Z",
  "is_preview": true,
  "urls": {
    "documentation": "https://communitystream-io.github.io/flock-branch-feature-auth-improvements/",
    "allure": "https://communitystream-io.github.io/flock-branch-feature-auth-improvements/allure/",
    "badges": "https://communitystream-io.github.io/flock-branch-feature-auth-improvements/badges/"
  }
}
```

## 🚀 **Supported Workflows**

### **GitHub Flow**
```bash
main → feature/new-feature → main
```
✅ **Perfect support** - feature branches get preview sites, merge back to main

### **Git Flow**
```bash
main → develop → feature/new-feature → develop → release/1.0 → main
```
✅ **Excellent support** - all branches get appropriate environments

### **Custom Workflows**
```bash
main → chore/maintenance → main
main → hotfix/urgent-fix → main  
main → epic/big-feature → main
```
✅ **Full support** - any branch naming convention works

## ⚡ **Performance & Limits**

### **Build Times**
- **Main branch**: ~3-5 minutes (includes GitHub Pages deployment)
- **Feature branches**: ~2-3 minutes (subdirectory deployment) 
- **Parallel builds**: Multiple branches can build simultaneously

### **Storage Limits**
- **GitHub Pages**: 1GB per repository
- **Artifacts**: Automatically cleaned after 7 days
- **Branch limit**: Practically unlimited (automatic cleanup)

### **Rate Limits**
- **GitHub Actions**: 2000 minutes/month (free tier)
- **Deployment frequency**: No specific limits
- **Concurrent builds**: Up to 20 parallel jobs

## 🔒 **Security & Permissions**

### **GitHub Pages Security**
- **Public repositories**: All branch sites are publicly accessible
- **Private repositories**: Requires GitHub Pro/Enterprise for private Pages

### **Token Permissions**
The workflow requires:
```yaml
permissions:
  contents: read      # Read repository content  
  pages: write        # Deploy to GitHub Pages
  id-token: write     # OIDC token for Pages deployment
```

### **Branch Protection**
- **Main branch**: Can be protected (recommended)
- **Feature branches**: No special protection needed
- **Automatic cleanup**: Only affects `gh-pages` branch

## 🎯 **Best Practices**

### **Branch Naming**
```bash
✅ Good:
feature/user-authentication  → flock-branch-feature-user-authentication
chore/update-dependencies     → flock-branch-chore-update-dependencies  
hotfix/security-patch         → flock-branch-hotfix-security-patch

❌ Avoid:
feature/user_auth!@#$        → flock-branch-feature-user-auth----
very/deeply/nested/branch    → flock-branch-very-deeply-nested-branch
```

### **Documentation Strategy**
- **Main branch**: Keep stable, comprehensive documentation
- **Feature branches**: Document new features and changes
- **Clean up**: Delete merged feature branches to clean up deployments

### **Testing Strategy** 
- **Feature branches**: Use for reviewing documentation changes
- **PR reviews**: Check documentation preview before merging
- **Integration**: Ensure new features are properly documented

## 🔍 **Monitoring & Debugging**

### **Workflow Status**
Monitor deployments in GitHub Actions:
```bash
https://github.com/CommunityStream-io/flock/actions/workflows/jekyll-deploy.yml
```

### **Deployment Logs**
Each deployment provides detailed logs:
- **Branch detection** and configuration
- **Jekyll build** process and timing
- **Asset copying** and integration  
- **GitHub Pages deployment** status

### **Site Health**
Check deployed sites:
```bash
# Main site
curl -I https://communitystream-io.github.io/flock/

# Feature branch  
curl -I https://communitystream-io.github.io/flock-branch-feature-auth-improvements/

# Branch metadata
curl https://communitystream-io.github.io/flock-branch-feature-auth-improvements/BRANCH.json
```

## 🎉 **Benefits**

### **For Developers**
- ✅ **No configuration needed** - just push any branch
- ✅ **Immediate feedback** - see documentation changes instantly
- ✅ **PR reviews** - review docs alongside code changes
- ✅ **Tool integration** - Allure, coverage, badges work per-branch

### **For Reviewers** 
- ✅ **Preview links** - see exactly how docs will look
- ✅ **Cross-references** - verify links work correctly
- ✅ **Visual review** - catch formatting and styling issues
- ✅ **Comprehensive view** - see docs in full site context

### **For Teams**
- ✅ **Branch strategies** - works with any Git workflow  
- ✅ **Collaboration** - multiple feature branches simultaneously
- ✅ **Integration** - seamless with existing development process
- ✅ **Maintenance** - automatic cleanup reduces manual work

---

## 🚀 **Getting Started**

**That's it!** 🎉 

The system is already configured and ready. Simply:

1. **Push any branch** with documentation changes
2. **Wait 2-5 minutes** for deployment  
3. **Visit** `https://communitystream-io.github.io/flock-branch-{your-branch-slug}/`
4. **Use the branch switcher** to navigate between branches
5. **Check PR comments** for automatic preview links

Your documentation now scales dynamically with your development workflow! 🦅

> 💡 **Pro Tip**: Use descriptive branch names for better URLs and easier navigation in the branch switcher.