#!/bin/bash

# Script to install npm dependencies with multiple fallback options

echo "Attempting to install dependencies..."

# Option 1: Try npm install with increased retries
echo "Trying npm install with retries..."
npm install --fetch-retries 5 --fetch-retry-mintimeout 20000 --fetch-retry-maxtimeout 120000 || {
    echo "Option 1 failed. Trying Option 2..."
    
    # Option 2: Try with a different registry mirror (Taobao mirror for China)
    echo "Trying with Taobao npm mirror..."
    npm install --registry https://registry.npmmirror.com || {
        echo "Option 2 failed. Trying Option 3..."
        
        # Option 3: Try installing packages one by one (slower but more reliable)
        echo "Trying to install packages individually..."
        npm install next@^14.2.0 react@^18.3.0 react-dom@^18.3.0 typescript@^5.4.0 || {
            echo "All options failed. Please check your network connection."
            echo "You may need to:"
            echo "1. Check if you're behind a proxy and configure it: npm config set proxy http://proxy:port"
            echo "2. Try using a VPN if network restrictions exist"
            echo "3. Install yarn: npm install -g yarn, then run: yarn install"
            exit 1
        }
    }
}

echo "Dependencies installed successfully!"
