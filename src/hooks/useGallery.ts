import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { GalleryData, GalleryImage } from "@/types/gallery";
import { galleryApi } from "@/services/api";

const CACHE_KEY = "merlin_gallery_cache";
const CACHE_TIMESTAMP_KEY = "merlin_gallery_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Global singleton to prevent multiple hook instances from fetching simultaneously
let globalInitialized = false;

interface UseGalleryReturn {
  galleryData: GalleryData;
  loading: boolean;
  error: string | null;
  refreshGallery: () => Promise<void>;
  updateImage: (id: string, updates: Partial<GalleryImage>) => void;
  deleteImage: (id: string) => void;
  addImage: (image: GalleryImage) => void;
  reorderImages: (images: GalleryImage[]) => void;
}

export function useGallery(): UseGalleryReturn {
  const [galleryData, setGalleryData] = useState<GalleryData>({
    finished: [],
    wip: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent multiple simultaneous fetches
  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);

  // Load data from cache
  const loadFromCache = useCallback((): GalleryData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp);
        if (cacheAge < CACHE_DURATION) {
          console.log("Gallery: Loading from cache");
          return JSON.parse(cached);
        } else {
          console.log("Gallery: Cache expired, clearing");
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        }
      }
    } catch (err) {
      console.error("Gallery: Error loading from cache:", err);
    }
    return null;
  }, []);

  // Save data to cache
  const saveToCache = useCallback((data: GalleryData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log("Gallery: Data saved to cache");
    } catch (err) {
      console.error("Gallery: Error saving to cache:", err);
    }
  }, []);

  // Fetch fresh data from API
  const fetchFromAPI = useCallback(async (): Promise<GalleryData> => {
    console.log("Gallery: Fetching from API");
    const data = await galleryApi.getGallery();
    saveToCache(data);
    return data;
  }, [saveToCache]);

  // Main fetch function with fallback
  const fetchGallery = useCallback(
    async (forceRefresh = false) => {
      // Prevent multiple simultaneous fetches
      if (fetchingRef.current && !forceRefresh) {
        console.log("Gallery: Fetch already in progress, skipping");
        return;
      }

      // Skip if already initialized globally and not forcing refresh
      if (globalInitialized && !forceRefresh) {
        console.log("Gallery: Already initialized globally, skipping fetch");
        return;
      }

      // Skip if already initialized locally and not forcing refresh
      if (initializedRef.current && !forceRefresh) {
        console.log("Gallery: Already initialized locally, skipping fetch");
        return;
      }

      fetchingRef.current = true;

      try {
        setLoading(true);
        setError(null);

        // Try cache first if not forcing refresh
        if (!forceRefresh) {
          const cachedData = loadFromCache();
          if (cachedData) {
            setGalleryData(cachedData);
            // Add a tiny bit longer loading time for better UX
            setTimeout(() => {
              setLoading(false);
            }, 800);
            initializedRef.current = true;
            globalInitialized = true;

            // Fetch fresh data in background
            try {
              const freshData = await fetchFromAPI();
              // Only update if data actually changed
              setGalleryData((prev) => {
                const prevJson = JSON.stringify(prev);
                const newJson = JSON.stringify(freshData);
                if (prevJson !== newJson) {
                  console.log("Gallery: Background refresh updated data");
                  return freshData;
                }
                console.log("Gallery: Background refresh - no changes");
                return prev;
              });
            } catch (err) {
              console.warn(
                "Gallery: Background refresh failed, using cached data"
              );
            }
            return;
          }
        }

        // No cache or force refresh - fetch from API
        const data = await fetchFromAPI();
        setGalleryData(data);
        initializedRef.current = true;
        globalInitialized = true;
      } catch (err) {
        console.error("Error fetching gallery:", err);

        // Try to fallback to cache on API error
        const cachedData = loadFromCache();
        if (cachedData) {
          console.log("Gallery: Using cached data as fallback");
          setGalleryData(cachedData);
          setError("Using offline data - some content may be outdated");
          initializedRef.current = true;
          globalInitialized = true;
        } else {
          setError("Failed to load gallery");
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [loadFromCache, fetchFromAPI] // Add proper dependencies
  );

  // Public refresh function - use useRef to avoid dependency issues
  const fetchGalleryRef = useRef(fetchGallery);
  fetchGalleryRef.current = fetchGallery;

  const refreshGallery = useCallback(async () => {
    await fetchGalleryRef.current(true);
  }, []); // No dependencies needed with ref pattern

  // Optimistic updates with error handling
  const updateImage = useCallback(
    async (id: string, updates: Partial<GalleryImage>) => {
      const originalData = galleryData;
      const optimisticData = {
        finished: originalData.finished.map((img) =>
          img.id === id ? { ...img, ...updates } : img
        ),
        wip: originalData.wip.map((img) =>
          img.id === id ? { ...img, ...updates } : img
        ),
      };
      setGalleryData(optimisticData);
      saveToCache(optimisticData);

      try {
        await galleryApi.updateImage(id, updates);
      } catch (err) {
        setError("Failed to update image. Please try again.");
        setGalleryData(originalData);
        saveToCache(originalData);
      }
    },
    [galleryData, saveToCache]
  );

  const deleteImage = useCallback(
    async (id: string) => {
      const originalData = galleryData;
      const optimisticData = {
        finished: originalData.finished.filter((img) => img.id !== id),
        wip: originalData.wip.filter((img) => img.id !== id),
      };
      setGalleryData(optimisticData);
      saveToCache(optimisticData);

      try {
        await galleryApi.deleteImage(id);
      } catch (err) {
        setError("Failed to delete image. Please try again.");
        setGalleryData(originalData);
        saveToCache(originalData);
      }
    },
    [galleryData, saveToCache]
  );

  const addImage = useCallback(
    async (image: GalleryImage) => {
      const originalData = galleryData;
      const optimisticData = {
        finished:
          image.category === "finished"
            ? [...originalData.finished, image]
            : originalData.finished,
        wip:
          image.category === "wip"
            ? [...originalData.wip, image]
            : originalData.wip,
      };
      setGalleryData(optimisticData);
      saveToCache(optimisticData);

      try {
        // This assumes the API call for addImage returns the final image object
        // If not, a refresh might be needed.
        await galleryApi.addImage(image);
      } catch (err) {
        setError("Failed to add image. Please try again.");
        setGalleryData(originalData);
        saveToCache(originalData);
      }
    },
    [galleryData, saveToCache]
  );

  const reorderImages = useCallback(
    (images: GalleryImage[]) => {
      setGalleryData((prev) => {
        const newFinished = images.filter((img) => img.category === "finished");
        const newWip = images.filter((img) => img.category === "wip");

        // Only update if data actually changed
        const finishedChanged =
          newFinished.length !== prev.finished.length ||
          newFinished.some((img, index) => img.id !== prev.finished[index]?.id);
        const wipChanged =
          newWip.length !== prev.wip.length ||
          newWip.some((img, index) => img.id !== prev.wip[index]?.id);

        if (!finishedChanged && !wipChanged) {
          return prev; // No changes, return same reference
        }

        const newData = { finished: newFinished, wip: newWip };
        saveToCache(newData);
        return newData;
      });
    },
    [saveToCache]
  );

  // Initial load - only run once on mount
  useEffect(() => {
    fetchGallery();

    // Cleanup function to reset initialization on unmount
    return () => {
      initializedRef.current = false;
      fetchingRef.current = false;
      // Don't reset global flags immediately - let other instances use them
      console.log("Gallery: Hook cleanup - reset local initialization flags");
    };
  }, []); // Empty dependency array - only run once

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      galleryData,
      loading,
      error,
      refreshGallery,
      updateImage,
      deleteImage,
      addImage,
      reorderImages,
    }),
    [
      galleryData,
      loading,
      error,
      refreshGallery,
      updateImage,
      deleteImage,
      addImage,
      reorderImages,
    ]
  );
}
