# 🔄 Release Workflow Diagram

## Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    RELEASE WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Developer    │
│ creates tag  │
│   v0.1.3     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  GitHub Actions: release.yml             │
│                                          │
│  1. ✅ Generate release notes            │
│     • From commits (conventional)       │
│     • From PRs                          │
│     • Contributors list                 │
│                                          │
│  2. ✅ Build all platforms              │
│     ┌─────────────────────┐             │
│     │ Windows  │ 4m 21s   │             │
│     │ macOS    │ 5m 04s   │             │
│     │ Linux    │ 4m 39s   │             │
│     └─────────────────────┘             │
│                                          │
│  3. ✅ Upload assets to release          │
│                                          │
│  4. ✅ Create DRAFT release              │
└──────────────┬───────────────────────────┘
               │
               ▼
      ┌────────────────┐
      │ Draft Release  │
      │   Created ✅   │
      └────────┬───────┘
               │
               ▼
      ┌─────────────────────────┐
      │ Maintainer Reviews      │
      │                         │
      │ • Check release notes   │
      │ • Verify assets         │
      │ • Edit notes if needed  │
      │ • Test installers (opt) │
      └──────────┬──────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Ready to Publish?  │
        └────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Trigger: publish-release.yml   │
    │                                │
    │ Input:                         │
    │ • version: 0.1.3               │
    │ • confirm: PUBLISH             │
    └────────┬───────────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Validate                │
    │ • Release exists?       │
    │ • Is draft?             │
    │ • Has assets?           │
    │ • Correct confirmation? │
    └────────┬────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │  Manual Approval         │
    │  (if environment setup)  │
    │                          │
    │  ⏳ Waiting...           │
    │                          │
    │  Reviewer clicks         │
    │  "Approve deployment"    │
    └────────┬─────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  Publish Release        │
    │                         │
    │  • Set draft=false      │
    │  • Add publish metadata │
    │  • Update release body  │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  🎉 Release Published!  │
    │                         │
    │  Users can download ✅  │
    └─────────────────────────┘
```

## Approval Flow Detail

```
┌─────────────────────────────────────────────┐
│          ENVIRONMENT PROTECTION             │
└─────────────────────────────────────────────┘

With Protection Enabled:

Publish Workflow Triggered
         │
         ▼
┌─────────────────┐
│ Validate Input  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│ Environment: production-     │
│              release         │
│                              │
│ Status: Waiting for approval │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Notification Sent To:        │
│ • @reviewer1                 │
│ • @reviewer2                 │
│ • @reviewer3                 │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Reviewer Opens Workflow      │
│                              │
│ Sees:                        │
│ • Version to publish         │
│ • Release notes preview      │
│ • Asset list                 │
│                              │
│ [Approve] [Reject]           │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
   [Approved]    [Rejected]
        │             │
        ▼             ▼
   Publish       Workflow
   Release         Fails
        │
        ▼
   ✅ Done
```

## Commands Flow

```
┌────────────────────────────────────────────┐
│           COMMAND SEQUENCE                 │
└────────────────────────────────────────────┘

Step 1: Create Release
─────────────────────────────────────────
$ npm version patch
v0.1.3

$ git push origin 43-distros v0.1.3
Pushed tag v0.1.3
  │
  └──> Triggers: release.yml
       ↓
       Builds + Creates Draft
       ↓
       ✅ Draft ready


Step 2: Review
─────────────────────────────────────────
$ gh release view v0.1.3
Shows:
• Auto-generated notes
• Asset list
• Build status


Step 3: Publish
─────────────────────────────────────────
$ gh workflow run publish-release.yml \
    -f version=0.1.3 \
    -f confirm=PUBLISH

Workflow runs:
  │
  └──> Validates release
       ↓
       Waits for approval (if enabled)
       ↓
       Publishes release
       ↓
       ✅ Public release
```

## State Transitions

```
┌────────┐  push tag   ┌─────────────┐
│  Code  │ ─────────> │   Building  │
└────────┘             └──────┬──────┘
                              │
                              ▼
                       ┌─────────────┐
                       │    Draft    │
                       │   Release   │
                       └──────┬──────┘
                              │
                       edit notes (optional)
                              │
                              ▼
                       ┌─────────────┐
                       │  Ready to   │
                       │   Publish   │
                       └──────┬──────┘
                              │
                       trigger publish
                              │
                              ▼
                       ┌─────────────┐
                       │  Awaiting   │
                       │  Approval   │
                       └──────┬──────┘
                              │
                         approved
                              │
                              ▼
                       ┌─────────────┐
                       │  Published  │
                       │   Release   │
                       └─────────────┘
```

## Error Paths

```
┌─────────────────────────────────────────┐
│         ERROR HANDLING                  │
└─────────────────────────────────────────┘

Build Fails
───────────────────
release.yml build job fails
  │
  ▼
Draft created without assets
  │
  ▼
publish-release.yml validates
  │
  └──> ❌ Fails: "No assets"
       
Fix: Re-run build jobs


Publish Fails
───────────────────
Wrong version
  │
  ▼
❌ Fails: "Release not found"
  │
  └──> Check version number
       Retry with correct version


Approval Timeout
───────────────────
No approval within time limit
  │
  ▼
❌ Workflow times out
  │
  └──> Re-run publish workflow
       Get approval faster


Wrong Confirmation
───────────────────
Typed "publish" instead of "PUBLISH"
  │
  ▼
❌ Fails: "Confirmation failed"
  │
  └──> Retry with exact text: PUBLISH
```

## Multi-User Scenario

```
┌────────────────────────────────────────────────┐
│          TEAM COLLABORATION                    │
└────────────────────────────────────────────────┘

Developer A             Developer B         Maintainer
    │                        │                   │
    │ Creates tag            │                   │
    │ v0.1.3                 │                   │
    ├─────────────────────> Workflow            │
    │                        runs                │
    │                        │                   │
    │                    Draft created           │
    │                        │                   │
    │                        │              Reviews draft
    │                        │                   │
    │                        │              Edits notes
    │                        │                   │
    │                  Triggers publish           │
    │                        │                   │
    │                        │              Approves
    │                        │                   │
    │                    Published! ✅            │
    │                        │                   │
    │ <─── Notification ────┴──────────────────> │
    │        Release v0.1.3 is live!             │
```

## Decision Tree

```
                Start Release
                      │
                      ▼
            ┌─────────────────┐
            │ Push tag?       │
            └────┬────────┬───┘
                 │        │
              [Yes]     [No]
                 │        │
                 │        └──> Manual dispatch
                 │               workflow
                 ▼
          Auto-build
          Create draft
                 │
                 ▼
          ┌──────────────┐
          │ Review OK?   │
          └──┬───────┬───┘
             │       │
          [Yes]     [No]
             │       │
             │       └──> Edit draft
             │            Go back to review
             ▼
       ┌────────────────┐
       │ Publish now?   │
       └──┬─────────┬───┘
          │         │
       [Yes]      [No]
          │         │
          │         └──> Wait for later
          │              Return when ready
          ▼
    ┌──────────────────┐
    │ Approval setup?  │
    └──┬───────────┬───┘
       │           │
    [Yes]        [No]
       │           │
       │           └──> Direct publish
       │                ✅ Done
       ▼
    Wait approval
       │
       ▼
    Approved?
       │
    [Yes]
       │
       ▼
    Publish ✅
```

## Integration Points

```
┌────────────────────────────────────────────┐
│        SYSTEM INTEGRATIONS                 │
└────────────────────────────────────────────┘

GitHub API
──────────────────
• Generate release notes
• Create/update releases
• Upload assets
• Validate drafts


electron-builder
──────────────────
• Build installers
• Auto-upload to releases
• Platform detection


Conventional Commits
──────────────────
• Parse commit messages
• Categorize changes
• Generate changelog


GitHub Environments
──────────────────
• Protection rules
• Required reviewers
• Approval tracking
```

## Quick Reference

| Action | Command | Output |
|--------|---------|--------|
| **Create** | `npm version patch && git push origin <branch> v0.1.3` | Draft release |
| **Review** | `gh release view v0.1.3` | Release details |
| **Publish** | `gh workflow run publish-release.yml -f version=0.1.3 -f confirm=PUBLISH` | Public release |
| **Approve** | GitHub UI → Approve deployment | Workflow continues |

---

**Visual Guide Version:** 1.0  
**Last Updated:** October 13, 2025

