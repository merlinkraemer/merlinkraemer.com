import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Zoom } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import type { SwiperRef } from "swiper/react";
import type { GalleryImage } from "@/types/gallery";
import clsx from "clsx";

interface LightboxProps {
  isOpen: boolean;
  currentImageId: string | null;
  allImages: GalleryImage[];
  onClose: () => void;
}

// Global image cache to persist across lightbox sessions
const imageCache = new Map<
  string,
  {
    loaded: boolean;
    error: boolean;
    element?: HTMLImageElement;
  }
>();

export default function Lightbox({
  isOpen,
  currentImageId,
  allImages,
  onClose,
}: LightboxProps) {
  const swiperRef = useRef<SwiperRef | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperInstance | null>(
    null
  );
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );

  // Calculate the correct index
  const activeIndex = allImages.findIndex((img) => img.id === currentImageId);

  // Preload images when gallery data changes
  const preloadImages = useCallback(async (images: GalleryImage[]) => {
    const preloadPromises = images.map((image) => {
      if (imageCache.has(image.id)) {
        const cached = imageCache.get(image.id)!;
        if (cached.loaded) {
          setPreloadedImages((prev) => new Set(prev).add(image.id));
          return Promise.resolve();
        }
      }

      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          imageCache.set(image.id, {
            loaded: true,
            error: false,
            element: img,
          });
          setPreloadedImages((prev) => new Set(prev).add(image.id));
          resolve();
        };
        img.onerror = () => {
          imageCache.set(image.id, { loaded: false, error: true });
          resolve();
        };
        img.src = image.src;
      });
    });

    await Promise.all(preloadPromises);
  }, []);

  // Preload images when allImages changes
  useEffect(() => {
    if (allImages.length > 0) {
      preloadImages(allImages);
    }
  }, [allImages, preloadImages]);

  // Sync Swiper with activeIndex when lightbox opens
  useEffect(() => {
    if (isOpen && activeIndex !== -1 && swiperInstance) {
      swiperInstance.slideTo(activeIndex);
    }
  }, [isOpen, activeIndex, swiperInstance]);

  // Handle image loading states
  const handleImageLoad = useCallback((imageId: string) => {
    setImageLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    setImageErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  const handleImageError = useCallback((imageId: string) => {
    setImageLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    setImageErrors((prev) => new Set(prev).add(imageId));
  }, []);

  const handleImageLoadStart = useCallback(
    (imageId: string) => {
      if (!preloadedImages.has(imageId)) {
        setImageLoading((prev) => new Set(prev).add(imageId));
      }
    },
    [preloadedImages]
  );

  // Check if image is preloaded or has error
  const isImagePreloaded = useCallback(
    (imageId: string) =>
      preloadedImages.has(imageId) || imageCache.get(imageId)?.loaded === true,
    [preloadedImages]
  );
  const hasImageError = useCallback(
    (imageId: string) =>
      imageErrors.has(imageId) || imageCache.get(imageId)?.error === true,
    [imageErrors]
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") swiperRef.current?.swiper?.slidePrev();
      if (e.key === "ArrowRight") swiperRef.current?.swiper?.slideNext();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (isOpen) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentImageId) {
    return null;
  }

  return createPortal(
    <div
      className="lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-heading"
    >
      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <h2 id="lightbox-heading" className="sr-only">
          Image Gallery Lightbox
        </h2>
        <button
          onClick={onClose}
          className="lightbox-close-button"
          aria-label="Close lightbox"
        >
          [X]
        </button>

        {allImages.length > 0 && (
          <div className="lightbox-counter" aria-live="polite">
            [{swiperInstance ? swiperInstance.activeIndex + 1 : activeIndex + 1}
            /{allImages.length}]
          </div>
        )}

        <div 
          className="lightbox-container"
          onClick={onClose}
          style={{ height: "100%", width: "100%" }}
        >
          <Swiper
            ref={swiperRef}
            initialSlide={activeIndex}
            slidesPerView={1}
            navigation={true}
            keyboard={{ enabled: true }}
            zoom={{ maxRatio: 3, minRatio: 1, toggle: true }}
            modules={[Navigation, Keyboard, Zoom]}
            style={{ height: "100%", width: "100%" }}
            onSwiper={setSwiperInstance}
          >
          {allImages.map((image) => {
            const isPreloaded = isImagePreloaded(image.id);
            const hasError = hasImageError(image.id);
            const isLoading = imageLoading.has(image.id) && !isPreloaded;

            return (
              <SwiperSlide key={image.id}>
                <div className="swiper-zoom-container">
                  {hasError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <div className="text-center text-white">
                        <div className="text-sm mb-2">Image failed to load</div>
                        <button
                          onClick={() => {
                            setImageErrors((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(image.id);
                              return newSet;
                            });
                            handleImageLoadStart(image.id);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-400"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        </div>
                      )}
                      <img
                        src={image.src}
                        alt={image.alt}
                        data-swiper-zoom="2"
                        onLoad={() => handleImageLoad(image.id)}
                        onError={() => handleImageError(image.id)}
                        onLoadStart={() => handleImageLoadStart(image.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={clsx(
                          "max-w-full max-h-full object-contain cursor-zoom-in",
                          {
                            "loading opacity-0": isLoading,
                            "transition-opacity duration-300 ease-in-out":
                              !isPreloaded,
                          }
                        )}
                      />
                      {isPreloaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 opacity-75">
                          ✓ Cached
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
          </Swiper>
        </div>
      </div>
    </div>,
    document.body
  );
}
