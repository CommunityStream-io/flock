# Flock Murmur - Quick Start Guide

## 🚀 For Developers

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Vercel CLI (optional, for local testing)

### Local Development

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run Angular dev server (client only)**
   ```bash
   ng serve flock-murmur
   # App runs at http://localhost:4200
   ```

3. **Run with Vercel dev server (full stack)**
   ```bash
   npm install -g vercel  # Install Vercel CLI once
   vercel dev
   # App runs at http://localhost:3000 with API functions
   ```

### Building for Production

```bash
# Build Angular app
npm run build:murmur

# Output: dist/flock-murmur/browser/
```

### Deploying to Vercel

**Option 1: Vercel CLI**
```bash
vercel --prod
```

**Option 2: GitHub Integration**
- Connect repository to Vercel
- Push to main branch
- Automatic deployment

### Environment Setup

**Local Development (.env.local)**
```bash
BLUESKY_API_URL=https://bsky.social/xrpc
```

**Vercel Dashboard**
- Go to Project Settings → Environment Variables
- Add required variables
- Redeploy for changes to take effect

## 🧪 Testing API Endpoints

### Upload Archive
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "archive=@/path/to/instagram-export.zip"
```

Response:
```json
{
  "success": true,
  "sessionId": "upload_1234567890_abc123",
  "filename": "instagram-export.zip",
  "size": 12345678,
  "message": "File uploaded successfully"
}
```

### Start Migration
```bash
curl -X POST http://localhost:3000/api/migrate \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "upload_1234567890_abc123",
    "config": {
      "blueskyCredentials": {
        "username": "user.bsky.social",
        "password": "app-password"
      },
      "simulate": false
    }
  }'
```

### Check Progress
```bash
curl "http://localhost:3000/api/progress?sessionId=upload_1234567890_abc123"
```

Response:
```json
{
  "success": true,
  "progress": {
    "status": "processing",
    "phase": "migration",
    "message": "Migrating post 25 of 50...",
    "percentage": 65,
    "currentPost": 25,
    "totalPosts": 50,
    "updatedAt": "2024-01-15T12:34:56.789Z"
  }
}
```

## 📝 Common Tasks

### Adding a New API Endpoint

1. Create file in `api/` directory:
   ```typescript
   // api/my-endpoint.ts
   import type { VercelRequest, VercelResponse } from '@vercel/node';
   
   export default async function handler(
     req: VercelRequest,
     res: VercelResponse
   ) {
     res.json({ message: 'Hello from my endpoint' });
   }
   ```

2. Access at: `http://localhost:3000/api/my-endpoint`

### Updating Function Limits

Edit `vercel.json`:
```json
{
  "functions": {
    "api/my-endpoint.ts": {
      "maxDuration": 60,
      "memory": 512
    }
  }
}
```

### Adding Environment Variables

**Development:**
Create `.env.local`:
```bash
MY_VAR=my-value
```

**Production:**
Add via Vercel Dashboard or CLI:
```bash
vercel env add MY_VAR production
```

### Debugging

**View Logs:**
```bash
vercel logs <deployment-url>
```

**Local Debug:**
- Add `console.log()` statements
- Check terminal output in `vercel dev`

**Production Debug:**
- View logs in Vercel Dashboard
- Check Runtime Logs section

## 🔧 Troubleshooting

### Build Fails

**Problem:** Dependencies not installing
```bash
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

**Problem:** TypeScript errors
```bash
# Solution: Check tsconfig.json
npx tsc --noEmit
```

### API Function Fails

**Problem:** Timeout
- Increase `maxDuration` in vercel.json
- Optimize processing logic

**Problem:** Out of memory
- Increase `memory` in vercel.json
- Use streaming for large files

**Problem:** KV storage errors
- Check KV database is configured
- Verify environment variables set

### Upload Issues

**Problem:** File too large
- Maximum 500MB supported
- Compress archive before upload

**Problem:** Invalid archive
- Verify ZIP format
- Check file structure matches Instagram export

## 📚 Project Structure

```
flock-murmur/
├── api/                          # Vercel edge functions
│   ├── lib/                      # Shared library code
│   │   ├── instagram-processor.ts
│   │   └── bluesky-migrator.ts
│   ├── upload.ts                 # Upload handler
│   ├── migrate.ts                # Migration processor
│   └── progress.ts               # Progress tracker
├── projects/flock-murmur/
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/         # Angular services
│   │   │   │   └── api.service.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   └── environments/         # Environment configs
│   │       ├── environment.ts
│   │       └── environment.prod.ts
│   └── package.json
├── vercel.json                   # Vercel configuration
├── .vercelignore                 # Deployment ignore
└── docs/
    └── VERCEL_DEPLOYMENT.md      # Full deployment guide
```

## 🔗 Useful Links

- [Full Deployment Guide](docs/VERCEL_DEPLOYMENT.md)
- [API Integration Guide](projects/flock-murmur/API_INTEGRATION.md)
- [Implementation Summary](VERCEL_IMPLEMENTATION.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Bluesky API Docs](https://docs.bsky.app/)

## 💡 Tips

1. **Use simulation mode** for testing migrations without posting
2. **Monitor function execution time** to optimize performance
3. **Set up KV storage** before deploying to Vercel
4. **Use app passwords** for Bluesky (not account password)
5. **Test locally first** with `vercel dev`
6. **Check logs** in Vercel Dashboard for debugging

## 🎯 Next Steps

1. Connect GitHub repository to Vercel
2. Configure Vercel KV database
3. Set environment variables
4. Deploy and test
5. Monitor performance and errors

---

Need help? Check the [full documentation](docs/VERCEL_DEPLOYMENT.md) or open an issue!
