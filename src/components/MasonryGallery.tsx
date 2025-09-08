import { useState, useRef, useEffect } from "react";
import type { GalleryImage } from "@/types/gallery";

interface MasonryGalleryProps {
  images: GalleryImage[];
  onImageClick: (imageId: string) => void;
}

// Lazy image component with intersection observer
function LazyImage({
  image,
  onImageClick,
  imageClassName,
  containerClassName,
}: {
  image: GalleryImage;
  onImageClick: (imageId: string) => void;
  imageClassName: string;
  containerClassName: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={containerClassName}>
      {isInView && (
        <img
          src={image.src}
          alt={image.alt}
          className={`${imageClassName} ${
            isLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
          loading="lazy"
          onClick={() => {
            console.log("MasonryGallery: Clicked image ID:", image.id);
            onImageClick(image.id);
          }}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            console.log("Image failed to load:", image.src);
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      {!isInView && (
        <div className={`${imageClassName} bg-gray-200 animate-pulse`} />
      )}
      <div className="p-2 bg-white">
        <i className="text-sm text-gray-600">{image.description}</i>
      </div>
    </div>
  );
}

export default function MasonryGallery({
  images,
  onImageClick,
}: MasonryGalleryProps) {
  return (
    <div className="gallery-grid">
      {images.map((image) => {
        // Basic uniform sizing for all images
        const imageClassName =
          "w-full h-auto bg-white cursor-pointer hover:opacity-90 transition-opacity";
        const containerClassName = "gallery-item";

        return (
          <LazyImage
            key={image.id}
            image={image}
            onImageClick={onImageClick}
            imageClassName={imageClassName}
            containerClassName={`${containerClassName} col-span-${image.width}`}
          />
        );
      })}
    </div>
  );
}
