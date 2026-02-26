# Troubleshooting npm install Timeout Issues

## Issue: npm install times out with ETIMEDOUT error

### Solution 1: Use Yarn (Recommended)
Yarn often handles network issues better than npm:

```bash
# Install yarn globally
npm install -g yarn

# Use yarn to install dependencies
cd /Users/a1/Documents/GitHub/fashion-main/frontend
yarn install
```

### Solution 2: Configure npm with longer timeouts
```bash
cd /Users/a1/Documents/GitHub/fashion-main/frontend

# Set npm registry and retry settings
npm config set registry https://registry.npmjs.org/
npm config set fetch-retries 10
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 300000

# Try installing again
npm install
```

### Solution 3: Use a different npm registry mirror
If you're in a region with slow npm registry access:

**Option A: Taobao Mirror (China)**
```bash
npm install --registry https://registry.npmmirror.com
```

**Option B: Cloudflare Mirror**
```bash
npm install --registry https://registry.npmjs.cf/
```

### Solution 4: Check network/proxy settings
```bash
# Check if you're behind a proxy
echo $HTTP_PROXY
echo $HTTPS_PROXY

# If you see proxy URLs, configure npm:
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port

# Or remove proxy if not needed:
npm config delete proxy
npm config delete https-proxy
```

### Solution 5: Install packages individually (slow but reliable)
```bash
cd /Users/a1/Documents/GitHub/fashion-main/frontend

# Install core dependencies first
npm install next@^14.2.0 react@^18.3.0 react-dom@^18.3.0 typescript@^5.4.0

# Then install the rest
npm install
```

### Solution 6: Clear npm cache and retry
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Solution 7: Check DNS resolution
```bash
# Test DNS resolution
nslookup registry.npmjs.org
ping registry.npmjs.org

# If DNS fails, try using Google DNS:
# macOS: System Preferences > Network > Advanced > DNS
# Add: 8.8.8.8 and 8.8.4.4
```

## After successful installation

Once dependencies are installed, create your `.env` file:

```bash
cd /Users/a1/Documents/GitHub/fashion-main/frontend
cp .env.example .env
```

Then edit `.env` if needed (default should work for local development).

## Start the development server

```bash
npm run dev
```

The frontend will be available at http://localhost:3000
