let galleryImages = [];
let currentIndex = 0;
let startX = 0;
let endX = 0;

function openLightbox(img) {
    galleryImages = Array.from(document.querySelectorAll('.gallery-images img'));
    currentIndex = galleryImages.indexOf(img);
    showLightboxImage();
    document.getElementById('lightbox').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function showLightboxImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    if (galleryImages[currentIndex]) {
        lightboxImg.src = galleryImages[currentIndex].src;
    }
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function(event) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.style.display !== 'block') return;
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

// Attach swipe and drag listeners after DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        // Mobile swipe
        lightbox.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        lightbox.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleSwipeOrDrag();
        });
        // Desktop drag
        let isDragging = false;
        lightbox.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX;
        });
        lightbox.addEventListener('mouseup', function(e) {
            if (!isDragging) return;
            isDragging = false;
            endX = e.clientX;
            handleSwipeOrDrag();
        });
        // Prevent image selection while dragging
        lightbox.addEventListener('mousemove', function(e) {
            if (isDragging) {
                e.preventDefault();
            }
        });
    }
});

function handleSwipeOrDrag() {
    const diff = endX - startX;
    if (Math.abs(diff) > 50) { // minimum swipe/drag distance
        if (diff < 0) {
            nextImage();
        } else {
            prevImage();
        }
    }
} 