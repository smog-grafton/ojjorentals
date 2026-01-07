# Vinkyaba Rentals Management System

A comprehensive rental property management system built with Next.js and Laravel.

## 🚀 Deployment

### Vercel Deployment

This project is configured for deployment on Vercel. Follow these steps:

1. **Connect Repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Add New Project"
   - Import the repository: `smog-grafton/vinkyabarentals`

2. **Configure Environment Variables**
   In Vercel project settings, add these environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://vkrportal.eavisualarts.org
   NEXTAUTH_SECRET=olH06diXb7Qf0CORHydGS0A287kdQUZOybPw1hGtS4A=
   NEXTAUTH_URL=https://your-vercel-domain.vercel.app
   ```

3. **Deploy**
   - Vercel will automatically detect Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

### Important Notes

- **Static Export**: This template does NOT support static export. It requires a Node.js server (which Vercel provides).
- **API Backend**: The Laravel backend is deployed separately at `https://vkrportal.eavisualarts.org`
- **Environment Variables**: Make sure to set all required environment variables in Vercel dashboard before deploying.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

- `src/app/` - Next.js App Router pages
- `src/views/` - React components and views
- `src/components/` - Reusable components
- `src/services/` - API service layer
- `src/contexts/` - React contexts

## 🔗 API Configuration

The frontend connects to the Laravel API backend. Update `NEXT_PUBLIC_API_URL` in your environment variables to point to your API server.

## 📝 License

Commercial License - All rights reserved
