# merlin's internet

A personal gallery website with integrated admin panel for managing artwork and links.

## 🎨 Features

- **Public Gallery**: Masonry layout showcasing finished and work-in-progress artwork
- **Admin Panel**: Full management interface at `/admin` for uploading and organizing images
- **Responsive Design**: Works on desktop and mobile devices
- **Image Lightbox**: Swiper-powered gallery viewer
- **Drag & Drop**: Reorder images in admin panel
- **Link Management**: Manage social media and project links

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Gallery**: React Masonry CSS + Swiper
- **Drag & Drop**: @dnd-kit
- **Routing**: React Router
- **Backend**: Node.js + Express + Prisma + SQLite
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── admin/          # Admin panel components
│   │   ├── Lightbox.tsx    # Image lightbox
│   │   └── MasonryGallery.tsx
│   ├── pages/
│   │   └── AdminPage.tsx   # Main admin interface
│   ├── services/
│   │   └── api.ts          # API client
│   └── types/
│       └── gallery.ts      # TypeScript types
├── backend/                # API server
│   ├── src/
│   │   └── index.ts        # Express server
│   └── prisma/
│       └── schema.prisma   # Database schema
└── public/                 # Static assets
```

## 🛠️ Development

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## 🌐 Deployment

The site is deployed on Vercel with automatic deployments from the main branch.

- **Public Site**: `merlinkraemer.com`
- **Admin Panel**: `merlinkraemer.com/admin`

## 📝 License

© 2025 Merlin Krämer
