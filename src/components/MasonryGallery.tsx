import { useState, useRef, useEffect } from "react";
import type { GalleryImage } from "@/types/gallery";

// Global image cache to prevent reloading - using window object to persist
declare global {
  interface Window {
    imageCache?: Set<string>;
  }
}

// Initialize global cache if it doesn't exist
if (typeof window !== "undefined" && !window.imageCache) {
  window.imageCache = new Set<string>();
  console.log("🔧 MasonryGallery: Initialized global image cache");
}

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
  shouldLoadImmediately = false,
}: {
  image: GalleryImage;
  onImageClick: (imageId: string) => void;
  imageClassName: string;
  containerClassName: string;
  shouldLoadImmediately?: boolean;
}) {
  const isInCache =
    typeof window !== "undefined" && window.imageCache?.has(image.src);
  const [isLoaded, setIsLoaded] = useState(isInCache);
  const [isInView, setIsInView] = useState(shouldLoadImmediately || isInCache);
  const [hasBeenInView, setHasBeenInView] = useState(
    shouldLoadImmediately || isInCache
  );
  const imgRef = useRef<HTMLDivElement>(null);

  console.log(`🖼️ LazyImage ${image.id}:`, {
    src: image.src,
    isInCache,
    shouldLoadImmediately,
    isLoaded,
    isInView,
    hasBeenInView,
    cacheSize: typeof window !== "undefined" ? window.imageCache?.size : 0,
  });

  useEffect(() => {
    console.log(`🔄 LazyImage ${image.id} useEffect:`, {
      isInCache,
      hasBeenInView,
      shouldLoadImmediately,
    });

    // If already loaded globally, show immediately
    if (isInCache) {
      console.log(
        `✅ LazyImage ${image.id}: Already in cache, showing immediately`
      );
      setIsInView(true);
      setHasBeenInView(true);
      setIsLoaded(true);
      return;
    }

    // If already loaded or should load immediately, don't re-observe
    if (hasBeenInView || shouldLoadImmediately) {
      console.log(
        `⏭️ LazyImage ${image.id}: Skipping observer (already loaded or immediate)`
      );
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log(
            `👁️ LazyImage ${image.id}: Intersection observed, loading image`
          );
          setIsInView(true);
          setHasBeenInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "200px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [hasBeenInView, shouldLoadImmediately]);

  return (
    <div ref={imgRef} className={containerClassName}>
      {isInView && (
        <img
          src={image.src}
          alt={image.alt}
          className={`${imageClassName} ${
            isLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
          onClick={() => {
            console.log("MasonryGallery: Clicked image ID:", image.id);
            onImageClick(image.id);
          }}
          onLoad={() => {
            console.log(
              `📥 LazyImage ${image.id}: Image loaded, adding to cache`
            );
            setIsLoaded(true);
            if (typeof window !== "undefined") {
              window.imageCache?.add(image.src);
              console.log(
                `💾 LazyImage ${image.id}: Added to cache. Cache size: ${window.imageCache?.size}`
              );
            }
          }}
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
  console.log("🖼️ MasonryGallery: Rendering", {
    totalImages: images.length,
    cacheSize: typeof window !== "undefined" ? window.imageCache?.size : 0,
    cacheContents:
      typeof window !== "undefined" ? Array.from(window.imageCache || []) : [],
  });

  return (
    <div className="gallery-grid">
      {images.map((image, index) => {
        // Basic uniform sizing for all images
        const imageClassName =
          "w-full h-auto bg-white cursor-pointer hover:opacity-90 transition-opacity";
        const containerClassName = "gallery-item";

        // Load first 2 images immediately
        const shouldLoadImmediately = index < 2;

        return (
          <LazyImage
            key={image.id}
            image={image}
            onImageClick={onImageClick}
            imageClassName={imageClassName}
            containerClassName={`${containerClassName} col-span-${image.width}`}
            shouldLoadImmediately={shouldLoadImmediately}
          />
        );
      })}
    </div>
  );
}
