#!/bin/bash
# Vercel build script - Force clean install

echo "🔧 Vercel build script started"
echo "📦 Current directory: $(pwd)"
echo "📋 Checking node_modules..."

# Remove node_modules if exists
if [ -d "node_modules" ]; then
    echo "🗑️  Removing old node_modules..."
    rm -rf node_modules
fi

# Force clean install
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit

echo "✅ Dependencies installed successfully"
echo "📊 Installed packages:"
ls node_modules | wc -l

# Verify critical packages
echo "🔍 Verifying critical packages..."
for pkg in dotenv qiniu formidable @supabase/supabase-js; do
    if [ -d "node_modules/$pkg" ]; then
        echo "  ✅ $pkg"
    else
        echo "  ❌ $pkg NOT FOUND"
    fi
done

echo "🎉 Build script completed"

