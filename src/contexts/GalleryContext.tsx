import { createContext, useContext, type ReactNode } from "react";
import { useGallery } from "@/hooks/useGallery";
import type { GalleryData, GalleryImage } from "@/types/gallery";

interface GalleryContextType {
  galleryData: GalleryData;
  loading: boolean;
  error: string | null;
  refreshGallery: () => Promise<void>;
  updateImage: (id: string, updates: Partial<GalleryImage>) => void;
  deleteImage: (id: string) => void;
  addImage: (image: GalleryImage) => void;
  reorderImages: (images: GalleryImage[]) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

interface GalleryProviderProps {
  children: ReactNode;
}

export function GalleryProvider({ children }: GalleryProviderProps) {
  const galleryData = useGallery();

  return (
    <GalleryContext.Provider value={galleryData}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error("useGalleryContext must be used within a GalleryProvider");
  }
  return context;
}
