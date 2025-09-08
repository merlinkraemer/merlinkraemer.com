export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  description: string;
  category: "finished" | "wip";
  year: number;
  order: number;
  width: number; // 1, 2, or 3 columns
  createdAt: string;
  updatedAt: string;
}

export interface GalleryData {
  finished: GalleryImage[];
  wip: GalleryImage[];
}
