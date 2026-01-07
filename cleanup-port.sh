#!/bin/bash

echo "Cleaning up port 3000 and Next.js processes..."

# Kill processes on port 3000
echo "Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"

# Kill any Next.js dev processes
echo "Killing Next.js processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "node.*next" 2>/dev/null

# Remove lock files
echo "Removing lock files..."
rm -rf .next/dev/lock .next/cache 2>/dev/null

# Remove entire .next directory for clean start
echo "Removing .next directory..."
rm -rf .next 2>/dev/null

echo "Cleanup complete! Port 3000 should now be free."
echo "You can now run: npm run dev"
