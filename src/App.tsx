import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useGalleryContext } from "@/contexts/GalleryContext";
import { linkApi } from "@/services/api";
import GalleryGrid from "@/components/GalleryGrid";
import Lightbox from "@/components/Lightbox";
import AdminPage from "@/pages/AdminPage";

interface HomePageProps {
  galleryData: any;
  error: string | null;
  openLightbox: (image: any, index: number) => void;
  lightboxProps: any;
}

const HomePage = ({
  galleryData,
  error,
  openLightbox,
  lightboxProps,
}: HomePageProps) => {
  // Create combined array for index calculation
  const allImages = [...galleryData.finished, ...galleryData.wip];
  const [links, setLinks] = useState<any[]>([]);

  // Load links from API
  useEffect(() => {
    const loadLinks = async () => {
      try {
        const linksData = await linkApi.getLinks();
        setLinks(linksData);
      } catch (error) {
        console.error("Error loading links:", error);
      }
    };
    loadLinks();
  }, []);

  // Separate links into two categories
  const regularLinks = links.filter(
    (link) =>
      !link.text.includes("SoundCloud") &&
      !link.text.includes("Bandcamp") &&
      !link.text.includes("Instagram") &&
      !link.text.includes("TikTok") &&
      !link.text.includes("YouTube") &&
      !link.text.includes("Twitch")
  );

  const socialLinks = links.filter(
    (link) =>
      link.text.includes("SoundCloud") ||
      link.text.includes("Bandcamp") ||
      link.text.includes("Instagram") ||
      link.text.includes("TikTok") ||
      link.text.includes("YouTube") ||
      link.text.includes("Twitch")
  );

  return (
    <div className="min-h-screen" style={{ position: "relative" }}>
      <div className="max-w-[1000px] mx-auto mb-20">
        <main className="px-[5%] py-8 pb-16">
          <div className="pt-[20vh] mobile-pt">
            <div className="header-container flex items-center justify-center my-4">
              <img
                src="/favicon.png"
                alt="Logo"
                className="logo"
                style={{ cursor: "pointer" }}
              />
            </div>

            <nav className="links mobile-links">
              {regularLinks.map((link, index) => (
                <React.Fragment key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: "pointer" }}
                  >
                    {link.text}
                  </a>
                  {(index < regularLinks.length - 1 ||
                    socialLinks.length > 0) && <br />}
                </React.Fragment>
              ))}
              {socialLinks.length > 0 && regularLinks.length > 0 && <br />}
              {socialLinks.map((link, index) => (
                <React.Fragment key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: "pointer" }}
                  >
                    {link.text}
                  </a>
                  {index < socialLinks.length - 1 && <br />}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </main>

        <br />

        <section className="gallery my-12 px-[5%]">
          <i>finished 2025:</i>
          <div className="mt-6">
            {error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : galleryData.finished.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No finished artworks yet
              </div>
            ) : (
              <GalleryGrid
                images={galleryData.finished}
                onImageClick={(imageId) => {
                  const image = allImages.find(
                    (img: any) => img.id === imageId
                  );
                  const index = allImages.findIndex(
                    (img: any) => img.id === imageId
                  );
                  if (image) openLightbox(image, index);
                }}
              />
            )}
          </div>
        </section>

        <section
          className="gallery my-12 px-[5%]"
          style={{ marginBottom: "6rem" }}
        >
          <i>wip 2025:</i>
          <div className="mt-6">
            {error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : galleryData.wip.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No works in progress yet
              </div>
            ) : (
              <GalleryGrid
                images={galleryData.wip}
                onImageClick={(imageId) => {
                  const image = allImages.find(
                    (img: any) => img.id === imageId
                  );
                  const index = allImages.findIndex(
                    (img: any) => img.id === imageId
                  );
                  if (image) openLightbox(image, index);
                }}
              />
            )}
          </div>
        </section>

        <footer className="px-[5%] py-8 pb-20" style={{ marginBottom: "5rem" }}>
          Willst du eins haben? Schreib mir eine DM oder email an{" "}
          <a href="mailto:merlinkraemer@gmail.com">merlinkraemer@gmail.com</a>
          <br />
          <br />
          <small>© 2025 Merlin Krämer</small>
          <br />
          <br />
          <a
            href="https://buymeacoffee.com/merlinkrae4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy me a coffee ☕
          </a>
        </footer>
      </div>

      {/* Swiper Lightbox */}
      <Lightbox {...lightboxProps} />
    </div>
  );
};

function App() {
  const { galleryData, loading, error } = useGalleryContext();
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);

  const openLightbox = (image: any, _index: number) => {
    setLightboxImageId(image.id);
  };

  const closeLightbox = () => {
    setLightboxImageId(null);
  };

  // Memoize allImages array to prevent unnecessary re-renders
  const allImages = useMemo(() => {
    return [...galleryData.finished, ...galleryData.wip];
  }, [galleryData.finished, galleryData.wip]);

  // Memoize lightbox props to prevent unnecessary re-renders
  const lightboxProps = useMemo(
    () => ({
      isOpen: !!lightboxImageId,
      currentImageId: lightboxImageId,
      allImages,
      onClose: closeLightbox,
    }),
    [lightboxImageId, allImages]
  );

  // Handle logo shake animation
  useEffect(() => {
    const handleLogoClick = (e: Event) => {
      e.preventDefault();
      const logo = e.target as HTMLElement;
      logo.classList.remove("shake");
      // Force reflow to restart animation
      void logo.offsetWidth;
      logo.classList.add("shake");
    };

    const handleAnimationEnd = (e: Event) => {
      const animationEvent = e as AnimationEvent;
      if (animationEvent.animationName === "logoShake") {
        const logo = e.target as HTMLElement;
        logo.classList.remove("shake");
      }
    };

    const handleClick = (e: Event) => {
      if ((e.target as HTMLElement).classList.contains("logo")) {
        handleLogoClick(e);
      }
    };

    const handleAnimationEndEvent = (e: Event) => {
      if ((e.target as HTMLElement).classList.contains("logo")) {
        handleAnimationEnd(e);
      }
    };

    // Add event listeners to document and delegate to .logo elements
    document.addEventListener("click", handleClick);
    document.addEventListener("animationend", handleAnimationEndEvent);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("animationend", handleAnimationEndEvent);
    };
  }, []);

  // Show loading screen only for initial gallery data loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="logo wiggle mb-6">
            <img
              src="/favicon.png"
              alt="Logo"
              className="logo"
              style={{ width: "48px", height: "48px" }}
            />
          </div>
          <div className="text-2xl font-bold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade-in">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                galleryData={galleryData}
                error={error}
                openLightbox={openLightbox}
                lightboxProps={lightboxProps}
              />
            }
          />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
