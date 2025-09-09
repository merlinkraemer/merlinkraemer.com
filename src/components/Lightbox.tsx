import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Zoom } from "swiper/modules";
import type { SwiperRef } from "swiper/react";
import type { GalleryImage } from "@/types/gallery";

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
  const [currentSlide, setCurrentSlide] = useState(0);
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
          setPreloadedImages((prev) => new Set([...prev, image.id]));
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
          setPreloadedImages((prev) => new Set([...prev, image.id]));
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

  // Sync currentSlide with activeIndex when lightbox opens
  useEffect(() => {
    if (isOpen && activeIndex !== -1) {
      setCurrentSlide(activeIndex);
      // Update Swiper slide if it's already initialized
      if (swiperRef.current?.swiper) {
        swiperRef.current.swiper.slideTo(activeIndex);
      }
    }
  }, [isOpen, activeIndex]);

  // Handle image loading states
  const handleImageLoad = useCallback((imageId: string) => {
    setImageLoading((prev) => {
      if (!prev.has(imageId)) return prev; // No change needed
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    setImageErrors((prev) => {
      if (!prev.has(imageId)) return prev; // No change needed
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  const handleImageError = useCallback((imageId: string) => {
    setImageLoading((prev) => {
      if (!prev.has(imageId)) return prev; // No change needed
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    setImageErrors((prev) => {
      if (prev.has(imageId)) return prev; // Already has error
      const newSet = new Set(prev);
      newSet.add(imageId);
      return newSet;
    });
  }, []);

  const handleImageLoadStart = useCallback(
    (imageId: string) => {
      // Only show loading if not preloaded
      if (!preloadedImages.has(imageId)) {
        setImageLoading((prev) => {
          if (prev.has(imageId)) return prev; // Already loading
          const newSet = new Set(prev);
          newSet.add(imageId);
          return newSet;
        });
      }
    },
    [preloadedImages]
  );

  // Check if image is preloaded
  const isImagePreloaded = useCallback(
    (imageId: string) => {
      return (
        preloadedImages.has(imageId) || imageCache.get(imageId)?.loaded === true
      );
    },
    [preloadedImages]
  );

  // Check if image has error
  const hasImageError = useCallback(
    (imageId: string) => {
      return (
        imageErrors.has(imageId) || imageCache.get(imageId)?.error === true
      );
    },
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

  // Always render the component, just hide/show it
  return createPortal(
    <div
      className="lightbox-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: isOpen && currentImageId ? "flex" : "none", // Show only when open and has image
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          maxWidth: "95vw",
          maxHeight: "95vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 20,
            background: "none",
            border: "none",
            color: "white",
            fontSize: "16px",
            fontFamily: "Courier New, monospace",
            cursor: "pointer",
          }}
        >
          [X]
        </button>

        <>
          {/* Image counter */}
          {allImages.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                color: "white",
                fontSize: "14px",
                fontFamily: "Courier New, monospace",
                zIndex: 20,
              }}
            >
              [{currentSlide + 1}/{allImages.length}]
            </div>
          )}

          {/* Swiper - only render when lightbox is open */}
          {isOpen && currentImageId && (
            <Swiper
              ref={swiperRef}
              initialSlide={activeIndex}
              slidesPerView={1}
              navigation={true}
              keyboard={{ enabled: true }}
              zoom={{ maxRatio: 3, minRatio: 1, toggle: true }}
              modules={[Navigation, Keyboard, Zoom]}
              style={{ height: "100%", width: "100%" }}
              onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
              onSwiper={(swiper) => {
                swiperRef.current = { swiper };
              }}
            >
              {allImages.map((image) => {
                const isPreloaded = isImagePreloaded(image.id);
                const hasError = hasImageError(image.id);
                const isLoading = imageLoading.has(image.id) && !isPreloaded;

                return (
                  <SwiperSlide key={image.id}>
                    <div className="swiper-zoom-container">
                      {hasError ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded">
                          <div className="text-center text-white">
                            <div className="text-sm mb-2">
                              Image failed to load
                            </div>
                            <button
                              onClick={() => {
                                setImageErrors((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.delete(image.id);
                                  return newSet;
                                });
                                handleImageLoadStart(image.id);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-400 rounded"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          {isLoading && (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded z-10">
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
                            className={`${isLoading ? "loading" : ""}`}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                              borderRadius: "8px",
                              cursor: "zoom-in",
                              opacity: isLoading ? 0 : 1,
                              transition: isPreloaded
                                ? "none"
                                : "opacity 0.3s ease-in-out",
                            }}
                          />
                          {isPreloaded && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded opacity-75">
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
          )}
        </>
      </div>
    </div>,
    document.body
  );
}
