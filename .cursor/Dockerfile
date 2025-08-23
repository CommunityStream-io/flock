FROM cimg/node:20.19.4-browsers

# Switch to root for system package installation
USER root

# Install Angular CLI globally
RUN npm install -g @angular/cli@latest

# Install Chrome testing dependencies
RUN apt-get update && apt-get install -y \
    chromium-browser \
    && rm -rf /var/lib/apt/lists/*


# Find and set Chrome binary path for testing
RUN CHROME_PATH=$(which chromium-browser) && \
    echo "Chrome found at: $CHROME_PATH" && \
    echo "export CHROME_BIN=$CHROME_PATH" >> ~/.bashrc && \
    echo "CHROME_BIN=$CHROME_PATH" >> /etc/environment

# Switch back to circleci user
USER circleci

# Set working directory
WORKDIR /workspace

# Copy source code
COPY . .
