#!/bin/bash

# WebDriverIO Extension Installation Script for Cursor DevContainer
# This script manually installs the WebDriverIO extension

set -e  # Exit on any error

echo "🚀 Starting WebDriverIO Extension Installation for Cursor DevContainer..."

# Define variables
EXTENSION_ID="webdriverio.webdriverio-snippets"
CURSOR_EXTENSIONS_DIR="$HOME/.cursor-server/extensions"
VSCODE_EXTENSIONS_DIR="$HOME/.vscode-server/extensions"
TEMP_DIR="/tmp/webdriverio-extension"

# Function to check if running in devcontainer
check_devcontainer() {
    if [[ -f /.dockerenv ]] || [[ -n "${DEVCONTAINER}" ]] || [[ -n "${CODESPACES}" ]]; then
        echo "✅ Detected devcontainer environment"
        return 0
    else
        echo "⚠️  Not running in a devcontainer, but continuing..."
        return 0
    fi
}

# Function to create extensions directory
create_extensions_dir() {
    local extensions_dir=$1
    if [[ ! -d "$extensions_dir" ]]; then
        echo "📁 Creating extensions directory: $extensions_dir"
        mkdir -p "$extensions_dir"
    else
        echo "📁 Extensions directory already exists: $extensions_dir"
    fi
}

# Function to download and install extension
install_extension() {
    echo "📥 Downloading WebDriverIO extension..."
    
    # Create temporary directory
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # Try different methods to get the extension
    if command -v curl >/dev/null 2>&1; then
        echo "Using curl to download extension..."
        # Download from VS Code marketplace API
        DOWNLOAD_URL="https://marketplace.visualstudio.com/_apis/public/gallery/publishers/webdriverio/vsextensions/webdriverio-snippets/latest/vspackage"
        curl -L -o webdriverio-extension.vsix "$DOWNLOAD_URL" || {
            echo "❌ Failed to download with curl, trying alternative method..."
            return 1
        }
    elif command -v wget >/dev/null 2>&1; then
        echo "Using wget to download extension..."
        DOWNLOAD_URL="https://marketplace.visualstudio.com/_apis/public/gallery/publishers/webdriverio/vsextensions/webdriverio-snippets/latest/vspackage"
        wget -O webdriverio-extension.vsix "$DOWNLOAD_URL" || {
            echo "❌ Failed to download with wget"
            return 1
        }
    else
        echo "❌ Neither curl nor wget available for downloading"
        return 1
    fi
    
    # Extract the extension
    if command -v unzip >/dev/null 2>&1; then
        echo "📦 Extracting extension..."
        unzip -q webdriverio-extension.vsix -d extracted/
        
        # Find the extension directory (usually contains package.json)
        EXTENSION_DIR=$(find extracted -name "package.json" -type f | head -1 | xargs dirname)
        
        if [[ -n "$EXTENSION_DIR" && -f "$EXTENSION_DIR/package.json" ]]; then
            # Read extension info
            PUBLISHER=$(grep -o '"publisher"[[:space:]]*:[[:space:]]*"[^"]*"' "$EXTENSION_DIR/package.json" | cut -d'"' -f4)
            NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$EXTENSION_DIR/package.json" | cut -d'"' -f4)
            VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$EXTENSION_DIR/package.json" | cut -d'"' -f4)
            
            if [[ -n "$PUBLISHER" && -n "$NAME" && -n "$VERSION" ]]; then
                FINAL_DIR_NAME="${PUBLISHER}.${NAME}-${VERSION}"
                echo "📋 Extension info: ${PUBLISHER}.${NAME} v${VERSION}"
            else
                echo "⚠️  Could not parse extension info, using default naming"
                FINAL_DIR_NAME="webdriverio.webdriverio-snippets"
            fi
        else
            echo "❌ Could not find valid extension structure"
            return 1
        fi
    else
        echo "❌ unzip command not available"
        return 1
    fi
}

# Function to copy extension to target directories
copy_extension() {
    local source_dir=$1
    local target_base=$2
    local extension_name=$3
    
    local target_dir="$target_base/$extension_name"
    
    echo "📁 Installing to: $target_dir"
    
    # Remove existing installation if present
    if [[ -d "$target_dir" ]]; then
        echo "🗑️  Removing existing installation..."
        rm -rf "$target_dir"
    fi
    
    # Copy extension
    cp -r "$source_dir" "$target_dir"
    
    # Set appropriate permissions
    chmod -R 755 "$target_dir"
    
    echo "✅ Extension installed successfully to $target_dir"
}

# Function to install via code command if available
install_via_code_command() {
    if command -v code >/dev/null 2>&1; then
        echo "🔧 Attempting installation via code command..."
        code --install-extension "$EXTENSION_ID" --force || {
            echo "⚠️  Code command installation failed, proceeding with manual installation..."
            return 1
        }
        echo "✅ Installation via code command successful"
        return 0
    else
        echo "ℹ️  Code command not available, using manual installation..."
        return 1
    fi
}

# Function to verify installation
verify_installation() {
    local extensions_dir=$1
    local extension_pattern="*webdriverio*"
    
    if find "$extensions_dir" -maxdepth 1 -type d -name "$extension_pattern" | grep -q .; then
        echo "✅ WebDriverIO extension found in $extensions_dir"
        find "$extensions_dir" -maxdepth 1 -type d -name "$extension_pattern" | while read -r dir; do
            echo "   📦 $(basename "$dir")"
        done
        return 0
    else
        echo "❌ WebDriverIO extension not found in $extensions_dir"
        return 1
    fi
}

# Main installation process
main() {
    echo "🔍 Checking environment..."
    check_devcontainer
    
    # Try installation via code command first
    if install_via_code_command; then
        echo "🎉 Installation completed via code command!"
        return 0
    fi
    
    echo "📦 Proceeding with manual installation..."
    
    # Create extensions directories
    create_extensions_dir "$CURSOR_EXTENSIONS_DIR"
    create_extensions_dir "$VSCODE_EXTENSIONS_DIR"
    
    # Download and extract extension
    if install_extension; then
        # Copy to both Cursor and VS Code extensions directories
        copy_extension "$TEMP_DIR/extracted/$EXTENSION_DIR" "$CURSOR_EXTENSIONS_DIR" "$FINAL_DIR_NAME"
        copy_extension "$TEMP_DIR/extracted/$EXTENSION_DIR" "$VSCODE_EXTENSIONS_DIR" "$FINAL_DIR_NAME"
        
        # Verify installations
        echo "🔍 Verifying installations..."
        verify_installation "$CURSOR_EXTENSIONS_DIR"
        verify_installation "$VSCODE_EXTENSIONS_DIR"
        
        echo "🎉 WebDriverIO extension installation completed!"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Restart Cursor/VS Code"
        echo "   2. The WebDriverIO snippets should now be available"
        echo "   3. You can verify by typing 'wdio' in a JavaScript/TypeScript file"
        
    else
        echo "❌ Manual installation failed"
        exit 1
    fi
    
    # Cleanup
    echo "🧹 Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --verify-only  Only verify if extension is installed"
    echo ""
    echo "This script installs the WebDriverIO extension for Cursor/VS Code in a devcontainer."
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_usage
        exit 0
        ;;
    --verify-only)
        echo "🔍 Verifying WebDriverIO extension installation..."
        verify_installation "$CURSOR_EXTENSIONS_DIR" && verify_installation "$VSCODE_EXTENSIONS_DIR"
        exit $?
        ;;
    "")
        main
        ;;
    *)
        echo "❌ Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
