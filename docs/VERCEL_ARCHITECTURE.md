# Flock Murmur - Vercel Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "User's Browser"
        A[Angular SPA<br/>Flock Murmur]
        A1[File Upload Component]
        A2[Progress Display]
        A3[Config Component]
        A --> A1
        A --> A2
        A --> A3
    end
    
    subgraph "Vercel Platform"
        subgraph "Static Assets"
            B[CDN<br/>HTML/CSS/JS]
        end
        
        subgraph "Edge Functions"
            C[Upload Handler<br/>300s, 1024MB]
            D[Migration Processor<br/>900s, 3008MB]
            E[Progress Tracker<br/>30s, 512MB]
        end
        
        subgraph "Storage"
            F[Vercel KV<br/>Session Data]
            G[Vercel KV<br/>File Data]
            H[Vercel KV<br/>Progress Data]
        end
    end
    
    subgraph "External Services"
        I[Bluesky API<br/>bsky.social]
    end
    
    A --> B
    A1 --> C
    A --> E
    A3 --> D
    A2 --> E
    
    C --> F
    C --> G
    D --> F
    D --> G
    D --> H
    E --> H
    
    D --> I
    
    style A fill:#2196f3
    style B fill:#4caf50
    style C fill:#ff9800
    style D fill:#f44336
    style E fill:#9c27b0
    style F fill:#ffeb3b
    style G fill:#ffeb3b
    style H fill:#ffeb3b
    style I fill:#00bcd4
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Client as Angular SPA
    participant Upload as /api/upload
    participant KV as Vercel KV
    participant Migrate as /api/migrate
    participant Progress as /api/progress
    participant Bluesky as Bluesky API
    
    User->>Client: Select Instagram ZIP
    Client->>Upload: POST /api/upload (file)
    Upload->>KV: Store file data
    Upload->>KV: Store metadata
    Upload-->>Client: Return sessionId
    
    User->>Client: Configure & Start
    Client->>Migrate: POST /api/migrate (sessionId, config)
    Migrate->>KV: Get file data
    Migrate->>Migrate: Extract archive
    Migrate->>KV: Update progress (extraction)
    
    loop For each post
        Migrate->>Migrate: Process post
        Migrate->>Bluesky: Upload media
        Migrate->>Bluesky: Create post
        Migrate->>KV: Update progress
        Migrate->>Migrate: Wait 3s (rate limit)
    end
    
    par Progress Polling
        loop Every 2s
            Client->>Progress: GET /api/progress?sessionId=xxx
            Progress->>KV: Get progress data
            Progress-->>Client: Return progress
            Client->>User: Update UI
        end
    end
    
    Migrate->>KV: Store final results
    Migrate-->>Client: Migration complete
    Client->>User: Show results
    
    Note over KV: Data expires after 1-2 hours
```

## Component Architecture

```mermaid
graph LR
    subgraph "Client Layer"
        A[ApiService]
        B[Components]
        C[Environment Config]
    end
    
    subgraph "API Layer"
        D[Upload Handler]
        E[Migration Processor]
        F[Progress Tracker]
    end
    
    subgraph "Library Layer"
        G[Instagram Processor]
        H[Bluesky Migrator]
    end
    
    subgraph "Storage Layer"
        I[Session Store]
        J[File Store]
        K[Progress Store]
    end
    
    B --> A
    C --> A
    A --> D
    A --> E
    A --> F
    
    D --> G
    E --> G
    E --> H
    
    D --> I
    D --> J
    E --> I
    E --> J
    E --> K
    F --> K
    
    style A fill:#2196f3
    style D fill:#ff9800
    style E fill:#f44336
    style F fill:#9c27b0
    style G fill:#4caf50
    style H fill:#00bcd4
    style I fill:#ffeb3b
    style J fill:#ffeb3b
    style K fill:#ffeb3b
```

## Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Upload: User uploads file
    Upload --> Stored: File stored in KV
    Stored --> MigrationPending: Returns sessionId
    MigrationPending --> Processing: User starts migration
    
    Processing --> Extracting: Initialize
    Extracting --> Migrating: Archive extracted
    
    state Migrating {
        [*] --> ProcessPost
        ProcessPost --> UploadMedia
        UploadMedia --> CreatePost
        CreatePost --> RateLimit
        RateLimit --> ProcessPost: Next post
        ProcessPost --> [*]: All posts done
    }
    
    Migrating --> Complete: Success
    Migrating --> Error: Failure
    
    Complete --> Cleanup: After TTL
    Error --> Cleanup: After TTL
    Cleanup --> [*]: Data deleted
    
    note right of Stored
        TTL: 1 hour
    end note
    
    note right of Complete
        TTL: 2 hours
    end note
```

## Deployment Flow

```mermaid
graph LR
    A[GitHub Repository] --> B[Vercel Platform]
    B --> C{Build Process}
    C --> D[Build Angular App]
    C --> E[Compile TypeScript API]
    
    D --> F[Static Files]
    E --> G[Edge Functions]
    
    F --> H[CDN Distribution]
    G --> I[Function Deployment]
    
    H --> J[Production URL]
    I --> J
    
    K[Vercel KV] --> J
    
    style A fill:#2196f3
    style B fill:#4caf50
    style C fill:#ff9800
    style D fill:#f44336
    style E fill:#9c27b0
    style F fill:#00bcd4
    style G fill:#ffeb3b
    style H fill:#e91e63
    style I fill:#795548
    style J fill:#3f51b5
    style K fill:#ffc107
```

## Error Handling Flow

```mermaid
graph TB
    A[Request] --> B{Validate Input}
    B -->|Valid| C[Process Request]
    B -->|Invalid| D[Return 400 Error]
    
    C --> E{Processing}
    E -->|Success| F[Update Progress]
    E -->|Error| G{Error Type}
    
    G -->|Network| H[Retry Logic]
    G -->|Validation| I[Return 400]
    G -->|Server| J[Return 500]
    G -->|Timeout| K[Return 504]
    
    H --> L{Retry Count}
    L -->|< 3| E
    L -->|>= 3| J
    
    F --> M[Return Success]
    D --> N[Log Error]
    I --> N
    J --> N
    K --> N
    
    N --> O[Update KV with Error]
    O --> P[Return to Client]
    
    style A fill:#2196f3
    style C fill:#4caf50
    style E fill:#ff9800
    style F fill:#4caf50
    style M fill:#4caf50
    style G fill:#f44336
    style N fill:#f44336
    style O fill:#f44336
    style P fill:#f44336
```

## Rate Limiting Strategy

```mermaid
graph LR
    A[Post Queue] --> B{Rate Limiter}
    B --> C[Process Post]
    C --> D[Upload Media]
    D --> E[Create Post]
    E --> F[Wait 3 seconds]
    F --> B
    
    B -->|Queue Empty| G[Migration Complete]
    
    H[Rate Limit Config] --> B
    I[Bluesky API Limits] --> H
    
    style A fill:#2196f3
    style B fill:#ff9800
    style C fill:#4caf50
    style D fill:#4caf50
    style E fill:#4caf50
    style F fill:#9c27b0
    style G fill:#00bcd4
    style H fill:#ffeb3b
    style I fill:#f44336
```

## Resource Management

```mermaid
graph TB
    subgraph "Upload Function"
        A[Request: 500MB]
        B[Memory: 1024MB]
        C[Time: 300s]
        A --> B
        B --> C
    end
    
    subgraph "Migration Function"
        D[Request: 500MB]
        E[Memory: 3008MB]
        F[Time: 900s]
        D --> E
        E --> F
    end
    
    subgraph "Progress Function"
        G[Request: 1KB]
        H[Memory: 512MB]
        I[Time: 30s]
        G --> H
        H --> I
    end
    
    subgraph "Vercel KV"
        J[Storage: 10GB]
        K[TTL: 1-2h]
        J --> K
    end
    
    C --> J
    F --> J
    I --> J
    
    style A fill:#2196f3
    style D fill:#f44336
    style G fill:#9c27b0
    style J fill:#ffeb3b
```

---

## Legend

- **Blue** - Client/User Layer
- **Green** - Static/Build Layer
- **Orange** - API/Processing Layer
- **Red** - Migration/Heavy Processing
- **Purple** - Tracking/Monitoring
- **Yellow** - Storage/State
- **Cyan** - External Services

## Key Metrics

| Component | Metric | Value |
|-----------|--------|-------|
| Upload Function | Max Duration | 300s |
| Upload Function | Max Memory | 1024MB |
| Upload Function | Max File Size | 500MB |
| Migration Function | Max Duration | 900s |
| Migration Function | Max Memory | 3008MB |
| Migration Function | Posts/Batch | 1 post per 3s |
| Progress Function | Max Duration | 30s |
| Progress Function | Max Memory | 512MB |
| Progress Function | Poll Interval | 2s |
| Vercel KV | Session TTL | 1 hour |
| Vercel KV | Progress TTL | 2 hours |
| Vercel KV | Max Storage | 10GB |

---

*Diagrams generated for Flock Murmur Vercel Implementation* 🌊✨
