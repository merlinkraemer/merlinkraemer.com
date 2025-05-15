let galleryImages = [];
let currentIndex = 0;
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
let initialScrollY = 0;

function openLightbox(imgElement) {
  galleryImages = Array.from(document.querySelectorAll(".gallery-images img"));
  currentIndex = galleryImages.indexOf(imgElement);

  if (currentIndex === -1) {
    console.error(
      "Image not found in galleryImages array. Cannot open lightbox."
    );
    return;
  }

  initialScrollY = window.scrollY;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.top = `-${initialScrollY}px`;

  lightbox.style.display = "flex";
  lightboxImg.src = imgElement.src;
}

function closeLightbox() {
  lightbox.style.display = "none";
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  document.body.style.top = "";
  window.scrollTo(0, initialScrollY);
  initialScrollY = 0;
}

window.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      updateThemeEmoji(savedTheme);
    }

    themeToggle.addEventListener("click", function (e) {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeEmoji(newTheme);
    });
  }

  function updateThemeEmoji(theme) {
    themeToggle.innerHTML = theme === "dark" ? "Lightmode 🌞 " : "Darkmode 🌙";
  }

  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", function (e) {
      e.preventDefault();
      logo.classList.remove("shake");
      void logo.offsetWidth;
      logo.classList.add("shake");

      setTimeout(() => {
        logo.classList.remove("shake");
      }, 800);
    });
  }

  if (!lightbox || !lightboxImg) {
    console.error("Lightbox elements not found!");
    return;
  }
});
