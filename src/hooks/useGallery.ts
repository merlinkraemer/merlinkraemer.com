import { useState, useEffect } from "react";
import type { GalleryData } from "@/types/gallery";
import { galleryApi } from "@/services/api";

// Preload critical images
const preloadImages = (images: string[]) => {
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

export function useGallery() {
  const [galleryData, setGalleryData] = useState<GalleryData>({
    finished: [],
    wip: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const data = await galleryApi.getGallery();
        setGalleryData(data);
        setError(null);

        // Preload first 3 images for faster initial load
        const criticalImages = data.finished.slice(0, 3).map((img) => img.src);
        preloadImages(criticalImages);
      } catch (err) {
        console.error("Error fetching gallery:", err);
        setError("Failed to load gallery");

        // Fallback to static data if API fails
        const fallbackData: GalleryData = {
          finished: [
            {
              id: "cozy-bed",
              src: "https://media.merlinkraemer.com/Cozy-Bed.webp",
              alt: "Cozy Bed",
              description: "56x42cm, Acryl, Pastel auf Holz - 50€",
              category: "finished",
              year: 2025,
              order: 0,
              width: 1,
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z",
            },
            {
              id: "studio-gatos",
              src: "https://media.merlinkraemer.com/Studio-Gatos.webp",
              alt: "Studio Gatos",
              description: "112x73cm, Acryl auf Holz - 165€ (Verkauft)",
              category: "finished",
              year: 2025,
              order: 1,
              width: 1,
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z",
            },
            {
              id: "katze-in-pflanze",
              src: "https://media.merlinkraemer.com/Katze-in-Pflanze.webp",
              alt: "Katze in Pflanze",
              description:
                "60x60cm, Acryl, Pastel auf Leinwand - 60€ (Verkauft)",
              category: "finished",
              year: 2025,
              order: 2,
              width: 1,
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z",
            },
            {
              id: "sonnenritter",
              src: "https://media.merlinkraemer.com/Sonnenritter.webp",
              alt: "Sonnenritter",
              description: "52x82cm, Acryl auf Holz - 75€ (Verkauft)",
              category: "finished",
              year: 2025,
              order: 3,
              width: 1,
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z",
            },
            {
              id: "pizzalady",
              src: "https://media.merlinkraemer.com/pizzalady.webp",
              alt: "Pizzalady",
              description: "40x40cm, Acryl auf Leinwand - 50€",
              category: "finished",
              year: 2025,
              order: 4,
              width: 1,
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z",
            },
            {
              id: "treibhaus",
              src: "https://media.merlinkraemer.com/Treibhaus.webp",
              alt: "Treibhaus",
              description:
                "76x78cm, Öl, Acryl, Latex auf Leinwand - 75€ (Verkauft)",
              category: "finished",
              year: 2025,
              order: 5,
              width: 1,
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z",
            },
            {
              id: "room1",
              src: "https://media.merlinkraemer.com/room1.webp",
              alt: "Room 1",
              description: "40x40cm, Acryl auf Leinwand (Reserviert)",
              category: "finished",
              year: 2025,
              order: 6,
              width: 1,
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z",
            },
          ],
          wip: [
            {
              id: "wip-2",
              src: "https://media.merlinkraemer.com/IMG_0409.webp",
              alt: "WIP 2",
              description: "40x80cm, Acryl auf Leinwand",
              category: "wip",
              year: 2025,
              order: 0,
              width: 1,
              createdAt: "2025-01-01T00:00:00Z",
              updatedAt: "2025-01-01T00:00:00Z",
            },
          ],
        };
        setGalleryData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return { galleryData, loading, error };
}
