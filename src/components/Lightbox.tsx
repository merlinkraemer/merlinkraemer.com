import React, { useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Keyboard } from "swiper/modules";
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

  // Preload adjacent images for smoother navigation
  const preloadAdjacentImages = useMemo(() => {
    if (!isOpen || !currentImageId) return [];
    const currentIndex = allImages.findIndex(
      (img) => img.id === currentImageId
    );
    const adjacentImages = [];

    // Preload previous and next images
    if (currentIndex > 0) {
      adjacentImages.push(allImages[currentIndex - 1].src);
    }
    if (currentIndex < allImages.length - 1) {
      adjacentImages.push(allImages[currentIndex + 1].src);
    }

    return adjacentImages;
  }, [isOpen, currentImageId, allImages]);

  // Preload adjacent images when lightbox opens
  React.useEffect(() => {
    if (preloadAdjacentImages.length > 0) {
      preloadAdjacentImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [preloadAdjacentImages]);

  // Handle keyboard events
  React.useEffect(() => {
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

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
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
            modules={[Pagination, Navigation, Keyboard]}
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
                <img
                  src={image.src}
                  alt={image.alt}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "8px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  }}
                  onError={(e) => {
                    console.error("Failed to load image:", image.src);
                    e.currentTarget.style.display = "none";
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>,
    document.body
  );
}
