# Website Rebuild Documentation: Merlin's Internet

## Overview
This document provides comprehensive details for rebuilding the current static HTML/CSS website as a modern web application using Vite and deploying to Vercel.

## Current Site Analysis

### Core Structure
- **Language**: German (`lang="de"`)
- **Title**: "merlin's internet" (hidden with `style="display: none"`)
- **Favicon**: `/favicon.png`
- **Layout**: Single page with centered content, max-width 800px

### Key Sections

#### 1. Header
- Logo (favicon.png) with animated swing effect
- 48px x 48px (24px on mobile)
- Click animation: shake effect
- Positioned with `padding-top: 25vh` on main container

#### 2. Navigation Links
Music/Audio links:
- `https://soundcloud.com/merlin040/oa-260725` - "@ OA 26-07-2025 - liveset"
- `https://soundcloud.com/merlin040/live-aus-der-werkstatt-1` - "Live aus der Werkstatt 1" - Mix
- `https://soundcloud.com/merlin040/keys-dont-match-remix` - "Keys Don't Match" - Stimming, Dominique Fricot - Merlin Remix
- `https://soundcloud.com/merlin040/set-20042025` - "@ Studio Boschstraße 20.04.2025 - Mix"
- `https://soundcloud.com/merlin040/sets/wanja` - "Der starke Wanja" EP

Social Media links:
- `https://soundcloud.com/merlin040` - SoundCloud 🎶
- `https://sunsetrecords-040.bandcamp.com/` - Bandcamp (Sunset Records) 🌞
- `https://instagram.com/merlinkraemer` - Instagram 🎨
- `https://www.tiktok.com/@merlinsroom` - TikTok
- `https://www.youtube.com/@merlins-room` - YouTube
- `https://www.twitch.tv/merlinsroom` - Twitch

#### 3. Gallery Section - "finished 2025:"
All images hosted on Cloudflare R2 at `https://media.merlinkraemer.com/`:

1. **Cozy-Bed.webp** - "56x42cm, Acryl, Pastel auf Holz - 50€"
2. **Studio-Gatos.webp** - "112x73cm, Acryl auf Holz - 165€ (Verkauft)"
3. **Katze-in-Pflanze.webp** - "60x60cm, Acryl, Pastel auf Leinwand - 60€ (Verkauft)"
4. **Sonnenritter.webp** - "52x82cm, Acryl auf Holz - 75€ (Verkauft)"
5. **pizzalady.webp** - "40x40cm, Acryl auf Leinwand - 50€"
6. **Treibhaus.webp** - "76x78cm, Öl, Acryl, Latex auf Leinwand - 75€ (Verkauft)"
7. **room1.webp** - "40x40cm, Acryl auf Leinwand (Reserviert)"

#### 4. Gallery Section - "wip 2025:"
1. **IMG_0409.webp** - "40x80cm, Acryl auf Leinwand"

#### 5. Footer
- Contact: `merlinkraemer@gmail.com`
- Copyright: "© 2025 Merlin Krämer"
- Buy me a coffee: `https://buymeacoffee.com/merlinkrae4`

### Styling Details

#### Color Scheme
```css
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
  --link-color: #0000ff;
  --gallery-bg: #ffffff;
}
```

#### Typography
- Font: `sans-serif`
- Body color: `#111`
- Link color: `#06f` (blue)
- Gallery descriptions: `#666` (gray), font-size: `0.9em`

#### Layout
- Max-width: `800px`
- Centered with `margin: 0 auto`
- Padding: `1em`
- Main section: `padding-top: 25vh`

#### Logo Animation
```css
@keyframes logoIdleSwing {
  0% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
  100% { transform: rotate(-3deg); }
}

@keyframes logoShake {
  /* Complex shake animation on click */
}
```

#### Gallery Grid
- `display: grid`
- `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`
- `gap: 1em`
- Responsive breakpoints:
  - 900px: 2 columns
  - 600px: 1 column

#### Lightbox
- Fixed overlay: `rgba(0, 0, 0, 0.85)`
- Centered image: `max-width: 90vw`, `max-height: 90vh`
- Body scroll lock when open

### Interactive Features

#### 1. Logo Click Animation
- Removes and re-adds 'shake' class
- Forces reflow with `void logo.offsetWidth`
- Animation cleanup on `animationend`

#### 2. Image Lightbox
- Click any gallery image to open lightbox
- Click lightbox background to close
- Body scroll prevention when open

### Assets Structure

#### Local Assets
- `favicon.png` - Logo/favicon (48x48px, 24x24px on mobile)

#### Cloudflare R2 Assets
**Base URL**: `https://media.merlinkraemer.com/`

**Gallery Images**:
- Cozy-Bed.webp
- Studio-Gatos.webp  
- Katze-in-Pflanze.webp
- Sonnenritter.webp
- pizzalady.webp
- Treibhaus.webp
- room1.webp
- IMG_0409.webp

**Local R2 Backup** (in `/R2/compressed_webp/`):
- IMG_0409.webp
- IMG_0412.webp
- IMG_0438.webp
- IMG_0440.webp
- IMG_0441.webp
- IMG_0443.webp
- IMG_0444.webp

## Modern Rebuild Requirements

### Technology Stack
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Framework**: Vanilla JS or lightweight framework (Vue/React)

### Key Implementation Notes

#### 1. Asset Management
- Migrate favicon.png to public folder
- Ensure R2 bucket URLs remain functional
- Implement lazy loading for gallery images
- Optimize images for web (already WebP format)

#### 2. Responsive Design
- Maintain exact breakpoints (900px, 600px)
- Preserve grid layout behavior
- Keep logo size adjustments

#### 3. Animations
- Implement CSS keyframe animations exactly as specified
- Maintain logo idle swing and click shake
- Preserve lightbox smooth transitions

#### 4. SEO & Performance
- Add proper meta tags
- Implement lazy loading
- Optimize for Core Web Vitals
- Maintain accessibility

#### 5. State Management
- Lightbox open/close state
- Body scroll lock
- Animation state management

### Vite Configuration
```javascript
// vite.config.js
export default {
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 3000
  }
}
```

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### File Structure Recommendation
```
project-root/
├── public/
│   └── favicon.png
├── src/
│   ├── main.js
│   ├── style.css
│   └── components/
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

### Critical CSS Classes to Preserve
- `.logo` - Logo styling and animations
- `.gallery` - Gallery container
- `.gallery-images` - Grid layout
- `.gallery-img` - Individual images
- `#lightbox` - Modal overlay
- `#lightbox-img` - Modal image
- `.noscroll` - Body scroll lock
- `.shake` - Logo animation trigger

### External Dependencies
- No external CSS/JS frameworks currently used
- All animations are pure CSS
- Lightbox functionality is vanilla JavaScript
- Consider adding: image optimization, lazy loading library

### Migration Checklist
- [ ] Set up Vite project structure
- [ ] Copy and adapt HTML structure
- [ ] Implement exact CSS styling
- [ ] Add JavaScript functionality
- [ ] Test logo animations
- [ ] Test gallery lightbox
- [ ] Verify responsive breakpoints
- [ ] Test all external links
- [ ] Verify R2 asset loading
- [ ] Configure Vercel deployment
- [ ] Test performance metrics
- [ ] Validate accessibility
- [ ] Cross-browser testing

### Performance Considerations
- Images are already optimized as WebP
- Implement proper caching headers
- Use Vercel's CDN for static assets
- Consider preloading critical assets
- Implement proper image lazy loading

This documentation provides all necessary details to recreate the exact look, feel, and functionality of the current static site as a modern web application.
