import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useGallery } from "@/hooks/useGallery";
import MasonryGallery from "@/components/MasonryGallery";
import Lightbox from "@/components/Lightbox";
import AdminPage from "@/pages/AdminPage";
import "./App.css";

function App() {
  const { galleryData, loading, error } = useGallery();
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);

  const openLightbox = (imageId: string) => {
    setLightboxImageId(imageId);
  };

  const closeLightbox = () => {
    setLightboxImageId(null);
  };

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

    // Add event listeners to document and delegate to .logo elements
    document.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).classList.contains("logo")) {
        handleLogoClick(e);
      }
    });

    document.addEventListener("animationend", (e) => {
      if ((e.target as HTMLElement).classList.contains("logo")) {
        handleAnimationEnd(e);
      }
    });

    return () => {
      document.removeEventListener("click", handleLogoClick);
      document.removeEventListener("animationend", handleAnimationEnd);
    };
  }, []);

  const HomePage = () => (
    <div className="force-90s min-h-screen" style={{ position: "relative" }}>
      <div className="max-w-[1000px] mx-auto mb-20">
        <main className="px-[5%] py-8 pb-16">
          <div className="pt-[20vh]">
            <div className="header-container flex items-center justify-between my-4">
              <img
                src="/favicon.png"
                alt="Logo"
                className="logo"
                style={{ cursor: "pointer" }}
              />
            </div>

            <nav className="links">
              <a
                href="https://soundcloud.com/merlin040/oa-260725"
                target="_blank"
                rel="noopener noreferrer"
              >
                @ OA 26-07-2025 - liveset
              </a>
              <br />
              <a
                href="https://soundcloud.com/merlin040/live-aus-der-werkstatt-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                "Live aus der Werkstatt 1" - Mix
              </a>
              <br />
              <a
                href="https://soundcloud.com/merlin040/keys-dont-match-remix"
                target="_blank"
                rel="noopener noreferrer"
              >
                "Keys Don't Match" - Stimming, Dominique Fricot - Merlin Remix
              </a>
              <br />
              <a
                href="https://soundcloud.com/merlin040/set-20042025"
                target="_blank"
                rel="noopener noreferrer"
              >
                @ Studio Boschstraße 20.04.2025 - Mix
              </a>
              <br />
              <a
                href="https://soundcloud.com/merlin040/sets/wanja"
                target="_blank"
                rel="noopener noreferrer"
              >
                "Der starke Wanja" EP
              </a>
              <br />
              <br />
              <a
                href="https://soundcloud.com/merlin040"
                target="_blank"
                rel="noopener noreferrer"
              >
                SoundCloud 🎶
              </a>
              <br />
              <a
                href="https://sunsetrecords-040.bandcamp.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bandcamp (Sunset Records) 🌞
              </a>
              <br />
              <a
                href="https://instagram.com/merlinkraemer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram 🎨
              </a>
              <br />
              <a
                href="https://www.tiktok.com/@merlinsroom"
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok
              </a>
              <br />
              <a
                href="https://www.youtube.com/@merlins-room"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
              </a>
              <br />
              <a
                href="https://www.twitch.tv/merlinsroom"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitch
              </a>
            </nav>
          </div>
        </main>

        <br />

        <section className="gallery my-12 px-[5%]">
          <i>finished 2025:</i>
          <div className="mt-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading gallery...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <MasonryGallery
                images={galleryData.finished}
                onImageClick={openLightbox}
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
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading gallery...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <MasonryGallery
                images={galleryData.wip}
                onImageClick={openLightbox}
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
      <Lightbox
        isOpen={!!lightboxImageId}
        currentImageId={lightboxImageId}
        allImages={[...galleryData.finished, ...galleryData.wip]}
        onClose={closeLightbox}
      />
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
