# Flock Murmur - Routes and Services

## ⚠️ Status: UPDATED

This document has been updated to reflect the removal of Vercel dependencies. Some services are now placeholders for future backend integration.

## Application Routes

### Core Routes
- `/` - Landing page
- `/config` - Configuration step
- `/upload` - File upload step  
- `/migrate` - Migration step
- `/results` - Results display

### Route Guards
- `StepGuard` - Ensures proper step progression
- `AuthGuard` - Validates authentication state

## Services Architecture

### Core Services

#### ApiService
- **Status**: Placeholder for future backend integration
- **Purpose**: Will handle HTTP communication with DigitalOcean backend
- **Current State**: Minimal implementation, ready for backend integration

#### MurmurFileProcessor
- **Status**: Updated to remove Vercel dependencies
- **Purpose**: File validation and preparation
- **Current State**: Client-side validation only, ready for backend integration

#### MurmurMigration  
- **Status**: Updated to remove Vercel API polling
- **Purpose**: Migration orchestration
- **Current State**: Placeholder implementation, ready for backend integration

#### MurmurBluesky
- **Status**: Active
- **Purpose**: Bluesky authentication and API interaction
- **Current State**: Functional for client-side operations

#### ConsoleLogger
- **Status**: Active
- **Purpose**: Logging service
- **Current State**: Functional

## Service Dependencies

### Injection Tokens
- `CONFIG` - Configuration service
- `BLUESKY` - Bluesky service implementation
- `FILE_PROCESSOR` - File processing service implementation
- `MIGRATION` - Migration service implementation

### Interface Compliance
All services implement shared interfaces from the `shared` library:
- `WebFileService` - File processing interface
- `WebBlueSkyService` - Bluesky operations interface
- `MigrationService` - Migration orchestration interface

## Future Backend Integration

### Planned Changes
1. **ApiService Enhancement**
   - Implement HTTP methods for DigitalOcean backend
   - Add file upload endpoints
   - Add migration progress tracking

2. **File Processing**
   - Integrate with DigitalOcean Spaces for file storage
   - Add server-side archive processing

3. **Migration Service**
   - Connect to backend migration endpoints
   - Implement real-time progress updates
   - Add error handling and retry logic

### Backend Requirements
- RESTful API endpoints
- File storage solution (DigitalOcean Spaces)
- Session management
- Progress tracking
- Error handling

## Development Notes

### Current Limitations
- No backend integration (services are placeholders)
- File processing is client-side only
- Migration cannot be executed without backend

### Next Steps
1. Design DigitalOcean App Platform architecture
2. Implement backend API endpoints
3. Update services to integrate with new backend
4. Test end-to-end functionality

---

*This document reflects the current state after Vercel dependency removal.*