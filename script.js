let galleryImages = [];
let currentIndex = 0;
let startX = 0;
// const imagesNodeList = document.querySelectorAll('.gallery-images img'); // Not needed for listener attachment due to inline onclick
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
let initialScrollY = 0;
let preloadedImages = new Set();

function preloadImage(src) {
    if (preloadedImages.has(src)) return;
    const img = new Image();
    img.src = src;
    preloadedImages.add(src);
}

function preloadAdjacentImages() {
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    preloadImage(galleryImages[nextIndex].src);
    preloadImage(galleryImages[prevIndex].src);
}

// The openLightbox function is called directly from your HTML's onclick attributes
function openLightbox(imgElement) {
    galleryImages = Array.from(document.querySelectorAll('.gallery-images img'));
    currentIndex = galleryImages.indexOf(imgElement);

    if (currentIndex === -1) {
        console.error("Image not found in galleryImages array. Cannot open lightbox.");
        return;
    }

    initialScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${initialScrollY}px`;

    lightbox.style.display = 'flex';
    showLightboxImage('initial');
    preloadAdjacentImages();
}

function showLightboxImage(direction = 'initial') {
    if (galleryImages.length === 0 || !galleryImages[currentIndex]) {
        console.warn("No image to show or invalid index:", currentIndex);
        closeLightbox();
        return;
    }

    const newSrc = galleryImages[currentIndex].src;
    
    // Preload the new image before showing it
    const tempImg = new Image();
    tempImg.onload = () => {
        if (direction === 'initial' || lightboxImg.src === newSrc) {
            lightboxImg.style.transition = 'none';
            lightboxImg.src = newSrc;
            lightboxImg.style.transform = 'translateX(0)';
            void lightboxImg.offsetWidth;
            return;
        }

        lightboxImg.style.transition = 'none';

        if (direction === 'next') {
            lightboxImg.style.transform = 'translateX(100%)';
        } else { // 'prev'
            lightboxImg.style.transform = 'translateX(-100%)';
        }

        lightboxImg.src = newSrc;
        void lightboxImg.offsetWidth;

        lightboxImg.style.transition = 'transform 0.3s ease-out';
        lightboxImg.style.transform = 'translateX(0)';
        
        // Preload next and previous images after showing current one
        preloadAdjacentImages();
    };
    tempImg.src = newSrc;
}

// closeLightbox is called from your HTML's onclick on #lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, initialScrollY);
    initialScrollY = 0;
}

document.addEventListener('keydown', function (event) {
    if (lightbox.style.display !== 'flex') return;

    if (event.key === 'Escape') {
        closeLightbox();
    } else if (event.key === 'ArrowRight') {
        nextImage();
    } else if (event.key === 'ArrowLeft') {
        prevImage();
    }
});

// nextImage and prevImage are called from keydown events AND your HTML onclick for nav buttons
function nextImage() {
    if (galleryImages.length === 0) return;
    currentIndex = (currentIndex + 1) % galleryImages.length;
    showLightboxImage('next');
}

function prevImage() {
    if (galleryImages.length === 0) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    showLightboxImage('prev');
}

function handleSwipe(endXValue) {
    if (startX === 0) return;
    const diff = endXValue - startX;
    const swipeThreshold = 30; // Reduced threshold for easier swiping

    if (Math.abs(diff) > swipeThreshold) {
        if (diff < 0) {
            nextImage();
        } else {
            prevImage();
        }
    } else {
        lightboxImg.style.transition = 'transform 0.2s ease-out';
        lightboxImg.style.transform = 'translateX(0)';
    }
    startX = 0;
}

window.addEventListener('DOMContentLoaded', function () {
    // Prevent logo link behavior and handle shake animation
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove and re-add the class to reset the animation
            logo.classList.remove('shake');
            void logo.offsetWidth; // Force reflow
            logo.classList.add('shake');
            
            // Remove the class after animation completes
            setTimeout(() => {
                logo.classList.remove('shake');
            }, 800);
        });
    }

    if (!lightbox || !lightboxImg) {
        console.error("Lightbox elements not found!");
        return;
    }

    lightbox.addEventListener('touchstart', (e) => {
        if (e.target !== lightboxImg) return;
        startX = e.touches[0].clientX;
        lightboxImg.style.transition = 'none';
    }, { passive: true });

    lightbox.addEventListener('touchmove', (e) => {
        if (!startX || e.target !== lightboxImg) return;
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        // Add resistance to the swipe
        const resistance = 0.5;
        const adjustedDiff = diff * resistance;
        lightboxImg.style.transform = `translateX(${adjustedDiff}px)`;
    }, { passive: false });

    lightbox.addEventListener('touchend', (e) => {
        if (!startX) return;
        handleSwipe(e.changedTouches[0].clientX);
    });

    lightbox.addEventListener('mousedown', (e) => {
        if (e.target !== lightboxImg) return;
        e.preventDefault();
        startX = e.clientX;
        lightboxImg.style.transition = 'none';
    });

    lightbox.addEventListener('mousemove', (e) => {
        if (!startX || e.target !== lightboxImg) return;
        const currentX = e.clientX;
        const diff = currentX - startX;
        lightboxImg.style.transform = `translateX(${diff}px)`;
    });

    lightbox.addEventListener('mouseup', (e) => {
        // Similar to touchend, process if drag was started on image.
        if (!startX) return;
        handleSwipe(e.clientX);
    });

    lightbox.addEventListener('mouseleave', (e) => {
        if (!startX) return; // Only if a drag was in progress
        // Check if the mouse truly left the lightbox, not just moved onto a child like a nav button
        // A more robust way is to check relatedTarget, but for simplicity, we'll handle based on startX
        handleSwipe(e.clientX);
    });
});