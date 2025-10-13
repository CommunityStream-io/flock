# 🔄 Release Workflow Diagrams

> **Note**: These Mermaid diagrams render automatically on GitHub

## Complete Release Flow

```mermaid
flowchart TD
    Start([Developer Creates Tag v0.1.3]) --> Trigger[GitHub Actions: release.yml]
    
    Trigger --> Generate[Generate Release Notes<br/>• From commits<br/>• From PRs<br/>• Contributors]
    
    Generate --> Build[Build All Platforms]
    
    Build --> BuildWin[Windows Build<br/>4m 21s]
    Build --> BuildMac[macOS Build<br/>5m 04s]
    Build --> BuildLinux[Linux Build<br/>4m 39s]
    
    BuildWin --> Upload[Upload Assets]
    BuildMac --> Upload
    BuildLinux --> Upload
    
    Upload --> Draft[Create DRAFT Release]
    
    Draft --> Review{Maintainer<br/>Reviews}
    
    Review -->|Edit Notes| EditNotes[Edit Release Notes]
    EditNotes --> Review
    
    Review -->|Ready| Publish[Trigger: publish-release.yml]
    
    Publish --> Validate{Validate<br/>• Release exists?<br/>• Is draft?<br/>• Has assets?<br/>• Typed PUBLISH?}
    
    Validate -->|Valid| Approval{Environment<br/>Protection?}
    Validate -->|Invalid| Error1[❌ Validation Failed]
    
    Approval -->|Yes| WaitApproval[⏳ Wait for Manual Approval]
    Approval -->|No| DoPublish[Publish Release]
    
    WaitApproval -->|Approved| DoPublish
    WaitApproval -->|Rejected| Error2[❌ Rejected]
    
    DoPublish --> AddMetadata[Add Publish Metadata<br/>• Who published<br/>• When<br/>• Workflow link]
    
    AddMetadata --> Done([✅ Release Published!<br/>Users can download])
    
    style Start fill:#e1f5e1
    style Done fill:#e1f5e1
    style Draft fill:#fff3cd
    style WaitApproval fill:#fff3cd
    style Error1 fill:#f8d7da
    style Error2 fill:#f8d7da
    style DoPublish fill:#d1ecf1
```

## Approval Flow Detail

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub Actions
    participant Env as Environment<br/>production-release
    participant Rev as Reviewer
    participant Users as End Users
    
    Dev->>GH: Trigger publish-release.yml<br/>version=0.1.3, confirm=PUBLISH
    
    GH->>GH: Validate Input
    
    GH->>Env: Request Deployment Approval
    
    Env->>Rev: 📧 Notify Reviewers
    
    Note over Rev: Reviewer sees:<br/>• Version to publish<br/>• Release notes<br/>• Asset list
    
    Rev->>Env: Click "Approve"
    
    Env->>GH: ✅ Approval Granted
    
    GH->>GH: Publish Release<br/>• Set draft=false<br/>• Add metadata
    
    GH->>Users: 🎉 Release Available
    
    GH->>Dev: ✅ Workflow Complete
```

## State Transitions

```mermaid
stateDiagram-v2
    [*] --> Development: Code changes
    
    Development --> Building: Push tag v0.1.3
    
    Building --> Draft: Build succeeds
    Building --> Failed: Build fails
    
    Draft --> Reviewing: Maintainer reviews
    
    Reviewing --> Draft: Edit notes
    Reviewing --> AwaitingApproval: Trigger publish
    
    AwaitingApproval --> Publishing: Approved
    AwaitingApproval --> Draft: Rejected
    
    Publishing --> Published: Success
    Publishing --> Failed: Error
    
    Published --> [*]
    Failed --> [*]
    
    note right of Draft
        • Auto-generated notes
        • All assets uploaded
        • Not public yet
    end note
    
    note right of AwaitingApproval
        • Requires reviewer approval
        • If environment protection enabled
    end note
    
    note right of Published
        • Public release
        • Users can download
        • Auto-update notified
    end note
```

## Decision Tree

```mermaid
flowchart TD
    Start([Start Release Process]) --> Q1{How to<br/>create release?}
    
    Q1 -->|Push Tag| AutoTag[git push origin branch v0.1.3]
    Q1 -->|Manual| ManualDispatch[Run workflow manually]
    
    AutoTag --> AutoBuild[Auto-build triggered]
    ManualDispatch --> AutoBuild
    
    AutoBuild --> DraftCreated[Draft Release Created]
    
    DraftCreated --> Q2{Review OK?}
    
    Q2 -->|No| EditDraft[Edit Draft Release]
    EditDraft --> Q2
    
    Q2 -->|Yes| Q3{Publish now?}
    
    Q3 -->|No| WaitLater[Wait for later<br/>Draft remains]
    WaitLater --> ReturnLater[Return when ready]
    ReturnLater --> Q3
    
    Q3 -->|Yes| Q4{Environment<br/>protection<br/>configured?}
    
    Q4 -->|No| DirectPublish[Direct Publish<br/>No approval needed]
    Q4 -->|Yes| NeedApproval[Trigger publish workflow]
    
    NeedApproval --> WaitApproval[⏳ Wait for Approval]
    
    WaitApproval --> Q5{Approved?}
    
    Q5 -->|Yes| PublishSuccess[✅ Publish Release]
    Q5 -->|No| Rejected[❌ Rejected]
    
    DirectPublish --> PublishSuccess
    PublishSuccess --> Done([Release Live!])
    
    style Start fill:#e1f5e1
    style Done fill:#e1f5e1
    style PublishSuccess fill:#d1ecf1
    style Rejected fill:#f8d7da
    style WaitApproval fill:#fff3cd
```

## Error Handling Flow

```mermaid
flowchart TD
    Trigger([Publish Workflow Triggered]) --> Check1{Release<br/>exists?}
    
    Check1 -->|No| Err1[❌ Release not found<br/>Check version number]
    Check1 -->|Yes| Check2{Is Draft?}
    
    Check2 -->|No| Err2[❌ Already published<br/>Can't re-publish]
    Check2 -->|Yes| Check3{Has Assets?}
    
    Check3 -->|No| Err3[❌ No assets<br/>Build may have failed]
    Check3 -->|Yes| Check4{Typed<br/>PUBLISH?}
    
    Check4 -->|No| Err4[❌ Confirmation failed<br/>Type exactly: PUBLISH]
    Check4 -->|Yes| Proceed[✅ Validation Passed]
    
    Proceed --> Approval{Approval<br/>needed?}
    
    Approval -->|Yes| WaitApproval[Wait for Approval]
    Approval -->|No| Publish
    
    WaitApproval --> Timeout{Timeout?}
    
    Timeout -->|Yes| Err5[❌ Approval timeout<br/>Re-run workflow]
    Timeout -->|No| Approved{Approved?}
    
    Approved -->|No| Err6[❌ Rejected by reviewer<br/>Fix issues & retry]
    Approved -->|Yes| Publish[Publish Release]
    
    Publish --> Success([✅ Published])
    
    Err1 --> Fix1[Fix: Use correct version]
    Err2 --> Fix2[Fix: Create new version]
    Err3 --> Fix3[Fix: Re-run build jobs]
    Err4 --> Fix4[Fix: Type PUBLISH exactly]
    Err5 --> Fix5[Fix: Re-run with faster approval]
    Err6 --> Fix6[Fix: Address reviewer concerns]
    
    style Success fill:#e1f5e1
    style Publish fill:#d1ecf1
    style Err1 fill:#f8d7da
    style Err2 fill:#f8d7da
    style Err3 fill:#f8d7da
    style Err4 fill:#f8d7da
    style Err5 fill:#f8d7da
    style Err6 fill:#f8d7da
```

## Multi-User Collaboration

```mermaid
sequenceDiagram
    participant DevA as Developer A
    participant DevB as Developer B
    participant GH as GitHub Actions
    participant Maint as Maintainer
    participant Users as End Users
    
    DevA->>DevA: Write code & commit
    DevA->>GH: Push tag v0.1.3
    
    activate GH
    Note over GH: Build all platforms<br/>Generate release notes
    GH->>GH: Create Draft Release
    deactivate GH
    
    GH-->>DevA: ✅ Draft Created
    GH-->>DevB: 📧 Notification
    GH-->>Maint: 📧 Notification
    
    Maint->>GH: Review Draft
    Maint->>GH: Edit release notes
    
    DevB->>Maint: "Ready to publish?"
    Maint->>DevB: "Yes, looks good!"
    
    Maint->>GH: Trigger publish workflow
    
    activate GH
    GH->>Maint: Request Approval
    deactivate GH
    
    Maint->>GH: ✅ Approve Deployment
    
    activate GH
    GH->>GH: Publish Release
    deactivate GH
    
    GH-->>Users: 🎉 New Release Available!
    GH-->>DevA: ✅ Published
    GH-->>DevB: ✅ Published
    GH-->>Maint: ✅ Published
```

## Build Pipeline

```mermaid
flowchart LR
    subgraph "release.yml Workflow"
        Tag[Tag Pushed<br/>v0.1.3] --> Notes[Generate<br/>Release Notes]
        
        Notes --> ParallelBuild[Parallel Builds]
        
        subgraph "Platform Builds"
            ParallelBuild --> Win[Windows<br/>NSIS, Portable, ZIP]
            ParallelBuild --> Mac[macOS<br/>DMG, ZIP Universal]
            ParallelBuild --> Lin[Linux<br/>AppImage, DEB, RPM]
        end
        
        Win --> Upload[Upload to<br/>GitHub Release]
        Mac --> Upload
        Lin --> Upload
        
        Upload --> Status[Add Build Status<br/>to Release Notes]
        
        Status --> Draft[Draft Release<br/>Created ✅]
    end
    
    style Tag fill:#e1f5e1
    style Draft fill:#fff3cd
    style Win fill:#d1ecf1
    style Mac fill:#d1ecf1
    style Lin fill:#d1ecf1
```

## Environment Protection Setup

```mermaid
flowchart TD
    Start([Setup Manual Approval]) --> Settings[Go to Repository Settings]
    
    Settings --> Env[Navigate to Environments]
    
    Env --> Create[Click 'New environment']
    
    Create --> Name[Name: production-release]
    
    Name --> Config[Configure environment]
    
    Config --> Rules[Set Protection Rules]
    
    Rules --> Rev[✅ Enable Required reviewers]
    
    Rev --> AddRev[Add reviewer emails/usernames]
    
    AddRev --> Optional{Additional<br/>settings?}
    
    Optional -->|Yes| Timer[⏱️ Set wait timer<br/>optional]
    Optional -->|Yes| Branch[🌿 Select branches<br/>optional]
    Optional -->|No| Save
    
    Timer --> Save[Save protection rules]
    Branch --> Save
    
    Save --> Test[Test the setup]
    
    Test --> TriggerPub[Trigger publish workflow]
    
    TriggerPub --> SeeApproval{See approval<br/>step?}
    
    SeeApproval -->|Yes| Success([✅ Setup Complete!])
    SeeApproval -->|No| Debug[Check environment name<br/>matches workflow]
    
    Debug --> Test
    
    style Start fill:#e1f5e1
    style Success fill:#e1f5e1
    style Rev fill:#d1ecf1
    style Debug fill:#fff3cd
```

## Release Types Workflow

```mermaid
flowchart TD
    Start([Need to Release]) --> Type{What changed?}
    
    Type -->|Bug fixes<br/>Security patches<br/>Docs| Patch[Patch Release<br/>0.0.X]
    Type -->|New features<br/>Improvements<br/>Non-breaking| Minor[Minor Release<br/>0.X.0]
    Type -->|Breaking changes<br/>Major features<br/>Architecture| Major[Major Release<br/>X.0.0]
    
    Patch --> PatchCmd["npm version patch"]
    Minor --> MinorCmd["npm version minor"]
    Major --> MajorCmd["npm version major"]
    
    PatchCmd --> QuickTest[Quick review & publish<br/>Same day]
    MinorCmd --> StandardTest[Review + test on 2-3 platforms<br/>1-2 days]
    MajorCmd --> FullTest[Comprehensive testing<br/>+ migration guide<br/>+ beta period<br/>1-2 weeks]
    
    QuickTest --> Push[Push tag]
    StandardTest --> Push
    FullTest --> Push
    
    Push --> Auto[Auto-build & draft]
    
    Auto --> Done([Published])
    
    style Start fill:#e1f5e1
    style Patch fill:#d4edda
    style Minor fill:#cce5ff
    style Major fill:#f8d7da
    style Done fill:#e1f5e1
```

## Integration Architecture

```mermaid
graph TB
    subgraph "External Services"
        GitHub[GitHub API]
        NPM[NPM Registry]
        EB[electron-builder]
    end
    
    subgraph "Workflows"
        Release[release.yml]
        Publish[publish-release.yml]
    end
    
    subgraph "Artifacts"
        Draft[Draft Release]
        Public[Published Release]
    end
    
    subgraph "Users"
        Dev[Developers]
        Maint[Maintainers]
        End[End Users]
    end
    
    Dev -->|Push tag| Release
    
    Release -->|Generate notes| GitHub
    Release -->|Install deps| NPM
    Release -->|Build| EB
    
    EB -->|Upload assets| Draft
    GitHub -->|Commit history| Draft
    
    Maint -->|Review| Draft
    Maint -->|Trigger| Publish
    
    Publish -->|Validate| Draft
    Publish -->|Approve| Maint
    Publish -->|Publish| Public
    
    Public -->|Download| End
    
    style Release fill:#d1ecf1
    style Publish fill:#d1ecf1
    style Draft fill:#fff3cd
    style Public fill:#e1f5e1
```

## Quick Command Reference

### Create Release
```bash
npm version patch && git push origin $(git branch --show-current) v$(node -p "require('./package.json').version")
```

### Review Draft
```bash
gh release view v0.1.3
```

### Publish
```bash
gh workflow run publish-release.yml -f version=0.1.3 -f confirm=PUBLISH
```

### Monitor
```bash
gh run watch $(gh run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

## Troubleshooting Diagram

```mermaid
flowchart TD
    Issue([Something Wrong?]) --> What{What's the issue?}
    
    What -->|Build failed| BuildFail[Check build logs<br/>gh run view run-id --log]
    What -->|Publish failed| PublishFail[Check validation<br/>errors in workflow]
    What -->|No approval| NoApproval[Check environment<br/>protection setup]
    What -->|Wrong notes| WrongNotes[Edit draft before<br/>publishing]
    
    BuildFail --> CheckDeps{Dependencies<br/>installed?}
    CheckDeps -->|No| InstallDeps[Run: npm ci]
    CheckDeps -->|Yes| CheckBuild{Angular<br/>build OK?}
    
    CheckBuild -->|No| FixBuild[Fix build errors<br/>Run: npm run build:native]
    CheckBuild -->|Yes| RerunBuild[Re-run failed jobs<br/>gh run rerun run-id --failed]
    
    PublishFail --> CheckVersion{Correct<br/>version?}
    CheckVersion -->|No| FixVersion[Use correct version<br/>from gh release list]
    CheckVersion -->|Yes| CheckConfirm{Typed<br/>PUBLISH?}
    
    CheckConfirm -->|No| FixConfirm[Type exactly: PUBLISH]
    CheckConfirm -->|Yes| CheckDraft{Is it<br/>draft?}
    
    CheckDraft -->|No| AlreadyPublished[❌ Already published<br/>Create new version]
    CheckDraft -->|Yes| ContactSupport[Check workflow logs<br/>Contact support if needed]
    
    NoApproval --> EnvExists{Environment<br/>exists?}
    EnvExists -->|No| CreateEnv[Create production-release<br/>environment]
    EnvExists -->|Yes| AddReviewers[Add yourself as<br/>required reviewer]
    
    WrongNotes --> EditOnGH[Edit release on<br/>GitHub UI]
    EditOnGH --> PublishEdited[Publish the edited<br/>version]
    
    InstallDeps --> Success([✅ Fixed])
    FixBuild --> Success
    RerunBuild --> Success
    FixVersion --> Success
    FixConfirm --> Success
    CreateEnv --> Success
    AddReviewers --> Success
    PublishEdited --> Success
    
    style Issue fill:#fff3cd
    style Success fill:#e1f5e1
    style AlreadyPublished fill:#f8d7da
```

---

## Legend

```mermaid
flowchart LR
    Success[✅ Success State] 
    Warning[⏳ Waiting State]
    Error[❌ Error State]
    Action[Action Step]
    Decision{Decision Point}
    
    style Success fill:#e1f5e1
    style Warning fill:#fff3cd
    style Error fill:#f8d7da
    style Action fill:#d1ecf1
```

## Related Documentation

- 📖 **[Full Process Guide](RELEASE_PROCESS.md)** - Detailed documentation
- ⚡ **[Quick Reference](RELEASE_QUICK_REFERENCE.md)** - Common commands
- 📊 **[Automation Summary](../AUTOMATION_SUMMARY.md)** - Implementation overview

---

**Mermaid Diagram Version:** 2.0  
**Last Updated:** October 13, 2025  
**Note:** All diagrams render automatically on GitHub
