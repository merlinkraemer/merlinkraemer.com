import type { GalleryImage } from "@/types/gallery";

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (imageId: string) => void;
}

export default function GalleryGrid({
  images,
  onImageClick,
}: GalleryGridProps) {
  // Sort images by order field to match backend ordering
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="gallery-grid">
      {sortedImages.map((image, index) => (
        <div
          key={image.id}
          className="gallery-item"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <img
            src={image.src}
            alt={image.alt}
            onClick={() => onImageClick(image.id)}
          />
          <div className="bg-white">
            <p className="text-sm text-gray-600">{image.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
