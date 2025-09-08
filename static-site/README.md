# Merlin's Internet - Static Site

This folder contains the clean, extracted static website files ready for hosting or migration.

## Files Included

- `index.html` - Main HTML file
- `style.css` - Complete stylesheet with animations and responsive design
- `script.js` - JavaScript for logo animations and lightbox functionality
- `favicon.png` - Logo/favicon image (48x48px)
- `WEBSITE_REBUILD_DOCUMENTATION.md` - Comprehensive rebuild documentation

## Hosting

This static site can be hosted on:
- GitHub Pages
- Netlify
- Vercel (static)
- Any static hosting service

## Assets

The site uses external assets from Cloudflare R2:
- Base URL: `https://media.merlinkraemer.com/`
- All gallery images are loaded from this CDN

## Local Development

To run locally:
1. Use any local server (Python, Node.js, Live Server extension)
2. Example with Python: `python -m http.server 8000`
3. Open `http://localhost:8000`

## Migration

See `WEBSITE_REBUILD_DOCUMENTATION.md` for detailed instructions on converting this to a modern web application using Vite and Vercel.
