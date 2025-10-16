# 🦅 Flock - Bluesky Social Migrator [![Feathering the Nest](https://github.com/CommunityStream-io/flock/actions/workflows/ci.yml/badge.svg)](https://github.com/CommunityStream-io/flock/actions/workflows/ci.yml) [![codecov](https://codecov.io/github/CommunityStream-io/flock/graph/badge.svg?token=Gvjk9DnKQb)](https://codecov.io/github/CommunityStream-io/flock) [![E2E Tests](https://img.shields.io/badge/E2E%20Tests-91%25%20(1211/1325)-green?style=flat-square&logo=allure&logoColor=white)](https://communitystream-io.github.io/flock/) 

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H51XLXW)

## 📥 **Download Flock Native**

**Desktop App Available Now!** Download the native desktop application for your platform:

[![Download  Version](https://img.shields.io/github/package-json/v/CommunityStream-io/flock?label=Download&style=for-the-badge&logo=github)](https://github.com/CommunityStream-io/flock/releases/latest)

**Supported Platforms:**
- 🪟 **Windows** - Windows 10 or later (64-bit)
- 🍎 **macOS** - macOS 10.15+ (Universal: Intel & Apple Silicon)
- 🐧 **Linux** - Ubuntu 20.04+ (AppImage, DEB, RPM)

📖 **[Installation Guide](INSTALLATION.md)** - Platform-specific installation instructions

---

A **flock** of Angular applications soaring through the social media migration skies! Each variant has its own personality while sharing the same nest of components and services. Built with a unified M3 Material design that keeps our flock flying in perfect formation.

## 🏗️ **Architecture & Documentation**

- **[🦅 Architecture](docs/ARCHITECTURE.md)** - The bird's eye view of our flock's nest
- **[🚀 Development](docs/DEVELOPMENT.md)** - Getting your wings and taking flight
- **[🧪 Testing](docs/TESTING.md)** - How our flock stays healthy and strong
- **[🌐 Cross-Platform E2E Testing](docs/CROSS_PLATFORM_E2E_TESTING.md)** - Testing across Windows, macOS, and Linux
- **[🎨 Styling](docs/STYLING.md)** - The flock's beautiful plumage

## 🦜 **Meet the Flock**

```
flock/
├── 📁 projects/
│   ├── 🎭 flock-mirage/          # The mirage bird - creates illusions for testing
│   │   ├── src/app/              # Simulates real migration without leaving the nest
│   │   ├── public/               # Feathers and static assets
│   │   └── tsconfig files        # TypeScript configuration
│   │
│   ├── 🌊 flock-murmur/          # The murmuration bird - dances through the web
│   │   ├── src/app/              # Graceful browser-based migration
│   │   ├── public/               # Web-ready feathers
│   │   └── tsconfig files        # TypeScript configuration
│   │
│   ├── 🦅 flock-native/          # The native bird - soars on desktop winds
│   │   ├── src/app/              # Native desktop migration with full power
│   │   ├── public/               # Desktop feathers
│   │   └── tsconfig files        # TypeScript configuration
│   │
│   ├── 🔧 services/              # The flock's shared wisdom
│   │   ├── src/lib/services/     # Services that adapt to each bird's environment
│   │   │   ├── desktop/          # Native bird's specialized services
│   │   │   ├── mvp/              # Mirage bird's simulation services
│   │   │   └── web/              # Murmuration bird's web services
│   │   └── public-api.ts         # How services spread their wings
│   │
│   └── 🧩 shared/                # The flock's common nest
│       ├── src/lib/components/   # Components all birds share
│       │   ├── file-upload/      # How birds carry their migration data
│       │   ├── step-navigation/  # Flight path guidance
│       │   ├── upload-progress/  # Migration journey tracking
│       │   └── theme-toggle/     # Day/night mode for our flock
│       └── public-api.ts         # Component exports
│
├── 📄 angular.json               # The flock's flight plan
├── 📦 package.json               # The flock's provisions
└── 📖 README.md                  # This field guide
```

## 🎨 **Shared M3 Material Design**

Our flock shares a beautiful, consistent Material Design 3 theme that ensures:
- **🎨 Unified Visual Language** - All birds look and feel the same
- **🔄 Seamless Component Swapping** - Services and nested components adapt per environment
- **📱 Responsive Nesting** - Components nest perfectly in each bird's habitat
- **🌙 Theme Consistency** - Light/dark modes that work across all variants

## 🚀 **Take Flight**

### **Prerequisites**
- Node.js 18+ and npm (the fuel for our migration engine)
- Angular CLI 20.1.5+ (our flight instructor)

### **Installation**
```bash
# Land in our repository
git clone <repository-url>
cd flock

# Gather provisions
npm install
```

### **Development - Choose Your Bird**
```bash
# Start with the mirage bird (default - great for testing)
ng serve

# Or choose your preferred bird:
ng serve flock-murmur     # 🌊 Web murmuration
ng serve flock-native     # 🦅 Desktop native
ng serve flock-mirage     # 🎭 Demo mirage
```

### **Building Your Flock**
```bash
# Build all birds at once
ng build

# Or build specific birds:
ng build flock-murmur     # Web variant
ng build flock-native     # Desktop variant
ng build flock-mirage     # Demo variant
```

## 🧪 **Testing the Flock**

### **Unit Tests**
```bash
# Test all birds
ng test

# Test specific birds:
ng test flock-mirage      # Test the mirage
ng test flock-murmur      # Test the murmuration
ng test flock-native      # Test the native
```

### **End-to-End Tests**
```bash
# Full migration journey tests
ng e2e

# Test specific migration paths:
ng e2e flock-mirage
ng e2e flock-murmur
ng e2e flock-native
```

### **Cross-Platform E2E Tests**
Test the Electron app across Windows, macOS, and Linux:
```bash
# Test on your current platform
npm run e2e:electron:windows    # Windows
npm run e2e:electron:macos      # macOS (auto-detects Intel/ARM)
npm run e2e:electron:linux      # Linux

# CI/CD cross-platform testing
npm run e2e:ci:electron:windows
npm run e2e:ci:electron:macos
npm run e2e:ci:electron:linux
```

📖 **[Cross-Platform E2E Testing Guide](docs/CROSS_PLATFORM_E2E_TESTING.md)** - Complete documentation for cross-platform testing

## 🔧 **Flock Development Tools**

### **Code Generation**
```bash
# Create new components, services, etc.
ng generate component component-name
ng generate service service-name
ng generate guard guard-name

# Generate in specific bird's nest:
ng generate component component-name --project=flock-mirage
```

### **Flock Management**
```bash
# See all birds in the flock
ng config projects

# Add a new bird to the flock
ng generate application new-bird-name

# Build with specific configurations
ng build --configuration=production
ng build --configuration=development
```

## 🪵 **Logs & Troubleshooting**

The Electron main process uses electron-log to persist logs to disk and prints the absolute log file path on startup.

- Windows: `%APPDATA%/flock/logs/main.log`
- macOS: `~/Library/Application Support/flock/logs/main.log`
- Linux: `~/.config/flock/logs/main.log`

### **Live Log Monitoring**
To follow logs in real-time during testing:
```bash
tail -f ~/Library/Application\ Support/flock/logs/main.log
```

Tip: On startup, look for the line:
```
📁 [LOG] Log file location: <absolute path>
```

## 🦜 **What Each Bird Does Best**

- **🎭 Mirage Bird (flock-mirage)**: Creates beautiful illusions for development and testing
- **🌊 Murmuration Bird (flock-murmur)**: Dances gracefully through web browsers with JSZip
- **🦅 Native Bird (flock-native)**: ⬇️ **[Download available!](https://github.com/CommunityStream-io/flock/releases/latest)** Soars with full desktop power using Electron and Node.js
  - ✅ **Enhanced Archive Extraction** - Smart Instagram archive detection with robust fallback logic
  - ✅ **Large File Support** - Successfully processes archives with 5000+ files
  - ✅ **Real-time Progress** - Live extraction and migration progress tracking
  - ✅ **Comprehensive Logging** - Detailed logs for troubleshooting and monitoring
- **🔧 Shared Wisdom**: Environment-aware services that adapt to each bird's needs
- **🧩 Common Nest**: Reusable components that work perfectly in any environment
- **📊 Flight Tracking**: Real-time migration progress monitoring
- **🎨 Unified Plumage**: Consistent M3 Material design across all variants
- **📱 Adaptive Nesting**: Responsive layouts that work everywhere

## 🔗 **Related Migration Flocks**

- **[Instagram to Bluesky CLI](../instagram-to-bluesky/)** - The migration engine that powers our flock
- **[WebUI](../webui/)** - Alternative web interface for different migration patterns

## 📖 **Migration Resources**

- **[Angular CLI Documentation](https://angular.dev/tools/cli)** - Flight instructor's manual
- **[Angular Architecture](https://angular.dev/style-guide)** - How to build better nests
- **[Electron Documentation](https://www.electronjs.org/docs)** - Native bird's flight manual
- **[Material Design 3](https://m3.material.io/)** - Our flock's visual language

## 🤝 **Join the Flock**

1. Follow our established flight patterns (architecture)
2. Use Angular CLI for all code generation
3. Implement BDD-style testing for new features
4. Keep the flock flying in formation (consistency)
5. Update our migration maps (documentation)

## ❤️ **Support Flock**

Flock is open source and free to use. If you find it helpful, consider supporting its development!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/H2H51XLXW)

Your support helps keep this project free and open source for everyone.

---

**🦅 Built with Angular 20.1.5** | **🏗️ Architecture-first design** | **🦜 Multi-bird support** | **🎨 Shared M3 Material nest**
