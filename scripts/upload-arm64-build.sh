#!/bin/bash

# Upload ARM64 Build to GitHub Release
# Usage: ./scripts/upload-arm64-build.sh [version]
# Example: ./scripts/upload-arm64-build.sh v0.6.7

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed. Please install it first:"
    echo "  brew install gh"
    echo "  gh auth login"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI. Please run:"
    echo "  gh auth login"
    exit 1
fi

# Get version from argument or package.json
if [ -n "$1" ]; then
    VERSION="$1"
    # Remove 'v' prefix if present
    VERSION="${VERSION#v}"
else
    VERSION=$(node -p "require('./package.json').version")
fi

TAG_NAME="v${VERSION}"

print_status "Uploading ARM64 build for version: $TAG_NAME"

# Check if build artifacts exist
DMG_FILE="dist/electron/Flock Native-${VERSION}-arm64.dmg"
ZIP_FILE="dist/electron/Flock Native-${VERSION}-arm64-mac.zip"

if [ ! -f "$DMG_FILE" ]; then
    print_error "DMG file not found: $DMG_FILE"
    print_status "Please run 'npm run pack:mac:arm' first to build the ARM64 version"
    exit 1
fi

if [ ! -f "$ZIP_FILE" ]; then
    print_error "ZIP file not found: $ZIP_FILE"
    print_status "Please run 'npm run pack:mac:arm' first to build the ARM64 version"
    exit 1
fi

print_success "Found build artifacts:"
echo "  📦 DMG: $DMG_FILE ($(du -h "$DMG_FILE" | cut -f1))"
echo "  📦 ZIP: $ZIP_FILE ($(du -h "$ZIP_FILE" | cut -f1))"

# Check if release exists
if ! gh release view "$TAG_NAME" &> /dev/null; then
    print_error "Release $TAG_NAME not found!"
    print_status "Available releases:"
    gh release list --limit 5
    exit 1
fi

print_status "Found release: $TAG_NAME"

# Check if ARM64 assets already exist
EXISTING_DMG=$(gh release view "$TAG_NAME" --json assets --jq '.assets[] | select(.name | contains("arm64.dmg")) | .name' 2>/dev/null || echo "")
EXISTING_ZIP=$(gh release view "$TAG_NAME" --json assets --jq '.assets[] | select(.name | contains("arm64-mac.zip")) | .name' 2>/dev/null || echo "")

if [ -n "$EXISTING_DMG" ] || [ -n "$EXISTING_ZIP" ]; then
    print_warning "ARM64 assets already exist in release:"
    [ -n "$EXISTING_DMG" ] && echo "  📦 DMG: $EXISTING_DMG"
    [ -n "$EXISTING_ZIP" ] && echo "  📦 ZIP: $EXISTING_ZIP"
    
    read -p "Do you want to replace them? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Upload cancelled"
        exit 0
    fi
    
    # Delete existing ARM64 assets
    print_status "Removing existing ARM64 assets..."
    [ -n "$EXISTING_DMG" ] && gh release delete-asset "$TAG_NAME" "$EXISTING_DMG" --yes
    [ -n "$EXISTING_ZIP" ] && gh release delete-asset "$TAG_NAME" "$EXISTING_ZIP" --yes
fi

# Upload new ARM64 assets
print_status "Uploading ARM64 build artifacts..."

if gh release upload "$TAG_NAME" "$DMG_FILE" "$ZIP_FILE"; then
    print_success "ARM64 build uploaded successfully!"
    print_status "Release URL: https://github.com/CommunityStream-io/flock/releases/tag/$TAG_NAME"
    
    # Show updated release info
    print_status "Updated release assets:"
    gh release view "$TAG_NAME" --json assets --jq '.assets[] | select(.name | contains("arm64")) | "  📦 " + .name + " (" + (.size | tostring) + " bytes)"'
    
else
    print_error "Failed to upload ARM64 build artifacts"
    exit 1
fi

print_success "🎉 ARM64 build upload complete!"
print_status "Users can now download native Apple Silicon builds from the release page."
