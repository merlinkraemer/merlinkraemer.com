let galleryImages = [];
let currentIndex = 0;
let startX = 0;
let endX = 0;
let currentImageIndex = 0;
const images = document.querySelectorAll('.gallery-images img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(imgElement) {
    galleryImages = Array.from(document.querySelectorAll('.gallery-images img'));
    currentImageIndex = Array.from(images).indexOf(imgElement);
    lightboxImg.src = imgElement.src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function showLightboxImage() {
    if (galleryImages[currentIndex]) {
        lightboxImg.src = galleryImages[currentIndex].src;
    }
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
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

function nextImage() {
    if (galleryImages.length === 0) return;
    currentIndex = (currentIndex + 1) % galleryImages.length;
    showLightboxImage();
}

function prevImage() {
    if (galleryImages.length === 0) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    showLightboxImage();
}

// Touch and mouse events for lightbox
window.addEventListener('DOMContentLoaded', function () {
    if (lightbox) {
        // Touch events for mobile
        lightbox.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        lightbox.addEventListener('touchend', (e) => {
            if (!startX) return;
            endX = e.changedTouches[0].clientX;
            handleSwipe();
            startX = 0;
        });

        // Mouse events for desktop
        lightbox.addEventListener('mousedown', (e) => {
            startX = e.clientX;
        });

        lightbox.addEventListener('mouseup', (e) => {
            if (!startX) return;
            endX = e.clientX;
            handleSwipe();
            startX = 0;
        });
    }
});

function handleSwipe() {
    const diff = endX - startX;
    if (Math.abs(diff) > 50) {
        if (diff < 0) {
            nextImage();
        } else {
            prevImage();
        }
    }
} 