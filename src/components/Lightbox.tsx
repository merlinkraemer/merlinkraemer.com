import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Keyboard, Zoom } from "swiper/modules";
import type { GalleryImage } from "@/types/gallery";

interface LightboxProps {
  isOpen: boolean;
  currentImageId: string | null;
  allImages: GalleryImage[];
  onClose: () => void;
}

export default function Lightbox({
  isOpen,
  currentImageId,
  allImages,
  onClose,
}: LightboxProps) {
  const swiperRef = useRef<any>(null);

  // Debug lightbox state changes and preserve scroll position
  React.useEffect(() => {
    if (isOpen) {
      console.log("🔍 Lightbox: OPENED", {
        currentImageId,
        totalImages: allImages.length,
        cacheSize: typeof window !== "undefined" ? window.imageCache?.size : 0,
      });
    } else {
      console.log("❌ Lightbox: CLOSED", {
        cacheSize: typeof window !== "undefined" ? window.imageCache?.size : 0,
      });
    }
  }, [isOpen, currentImageId, allImages.length]);

  // Preserve scroll position when lightbox closes
  React.useEffect(() => {
    if (isOpen) {
      // Store current scroll position when lightbox opens
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restore scroll position when lightbox closes
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [isOpen]);

  // Calculate the correct index immediately
  const activeIndex = React.useMemo(() => {
    if (currentImageId && allImages.length > 0) {
      const index = allImages.findIndex((img) => img.id === currentImageId);
      console.log("Lightbox: Calculating index for image ID:", currentImageId);
      console.log("Lightbox: Found at index:", index);
      return index !== -1 ? index : 0;
    }
    return 0;
  }, [currentImageId, allImages]);

  const [currentSlide, setCurrentSlide] = useState(activeIndex);

  // Preload images immediately when lightbox opens
  React.useEffect(() => {
    if (isOpen && allImages.length > 0) {
      console.log("🔍 Lightbox opened, preloading all images...", {
        totalImages: allImages.length,
        currentCacheSize:
          typeof window !== "undefined" ? window.imageCache?.size : 0,
      });

      allImages.forEach((image, index) => {
        // Check if already cached
        if (
          typeof window !== "undefined" &&
          window.imageCache?.has(image.src)
        ) {
          console.log(`⏭️ Lightbox: Image ${index} already cached:`, image.src);
          return; // Skip if already cached
        }

        console.log(`🔄 Lightbox: Preloading image ${index}:`, image.src);
        // Preload with high priority
        const img = new Image();
        img.onload = () => {
          if (typeof window !== "undefined") {
            window.imageCache?.add(image.src);
            console.log(
              `✅ Lightbox: Cached image ${index}:`,
              image.src,
              "Cache size:",
              window.imageCache?.size
            );
          }
        };
        img.onerror = () => {
          console.log(
            `❌ Lightbox: Failed to preload image ${index}:`,
            image.src
          );
        };
        img.src = image.src;
      });
    }
  }, [isOpen, allImages]);

  // Handle keyboard events and prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          swiperRef.current?.swiper?.slidePrev();
          break;
        case "ArrowRight":
          swiperRef.current?.swiper?.slideNext();
          break;
      }
    };

    // Prevent background scroll on mobile
    const preventScroll = (e: TouchEvent) => {
      if (isOpen) {
        e.preventDefault();
      }
    };

    // Prevent background scroll on wheel events
    const preventWheel = (e: WheelEvent) => {
      if (isOpen) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("touchmove", preventScroll, { passive: false });
      document.addEventListener("wheel", preventWheel, { passive: false });

      // Prevent background scroll using CSS class
      document.body.classList.add("lightbox-open");
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("wheel", preventWheel);

      // Restore scrolling
      document.body.classList.remove("lightbox-open");
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentImageId) return null;

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
        display: "flex",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            backgroundColor: "transparent",
            color: "white",
            border: "none",
            width: "auto",
            height: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "16px",
            fontFamily: "Courier New, monospace",
            fontWeight: "normal",
            padding: "4px",
            textDecoration: "none",
          }}
          aria-label="Close lightbox"
        >
          [X]
        </button>

        {/* Image counter */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            color: "white",
            fontSize: "14px",
            backgroundColor: "transparent",
            border: "none",
            padding: "4px",
            fontFamily: "Courier New, monospace",
            fontWeight: "normal",
            zIndex: 20,
          }}
        >
          [{currentSlide + 1}/{allImages.length}]
        </div>

        {/* Swiper */}
        <div style={{ width: "100%", height: "100%" }}>
          <Swiper
            key={`${isOpen}-${currentImageId}`}
            ref={swiperRef}
            initialSlide={activeIndex}
            slidesPerView={1}
            centeredSlides={true}
            spaceBetween={0}
            pagination={false}
            navigation={true}
            keyboard={{
              enabled: true,
            }}
            zoom={{
              maxRatio: 3,
              minRatio: 1,
              toggle: true,
            }}
            touchRatio={1}
            touchAngle={45}
            simulateTouch={true}
            allowTouchMove={true}
            modules={[Pagination, Navigation, Keyboard, Zoom]}
            style={{ height: "100%", width: "100%" }}
            onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
            onSwiper={(swiper) => {
              console.log(
                "Lightbox: Swiper initialized with initialSlide:",
                activeIndex
              );
              console.log(
                "Lightbox: Swiper actual activeIndex:",
                swiper.activeIndex
              );
            }}
          >
            {allImages.map((image) => (
              <SwiperSlide
                key={image.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  className="swiper-zoom-container"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    data-swiper-zoom="2"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      borderRadius: "8px",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      cursor: "zoom-in",
                    }}
                    onError={(e) => {
                      console.error("Failed to load image:", image.src);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>,
    document.body
  );
}
