import axios from "axios";
import type { GalleryData, GalleryImage } from "@/types/gallery";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const galleryApi = {
  // Get all gallery images
  getGallery: async (): Promise<GalleryData> => {
    const response = await api.get("/gallery");
    return response.data;
  },

  // Add new image (admin only)
  addImage: async (formData: FormData): Promise<GalleryImage> => {
    try {
      const response = await api.post("/gallery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("API: Upload failed:", error);
      if (error.response) {
        console.error("API: Response status:", error.response.status);
        console.error("API: Response data:", error.response.data);
      }
      throw error;
    }
  },

  // Update image (admin only)
  updateImage: async (
    id: string,
    data: Partial<GalleryImage>
  ): Promise<GalleryImage> => {
    const response = await api.put(`/gallery/${id}`, data);
    return response.data;
  },

  // Delete image (admin only)
  deleteImage: async (id: string): Promise<void> => {
    await api.delete(`/gallery/${id}`);
  },
};

export const linkApi = {
  // Get all links
  getLinks: async (): Promise<any[]> => {
    const response = await api.get("/links");
    return response.data;
  },

  // Create new link
  createLink: async (text: string, url: string): Promise<any> => {
    const response = await api.post("/links", { text, url });
    return response.data;
  },

  // Update link
  updateLink: async (id: number, text: string, url: string): Promise<any> => {
    const response = await api.put(`/links/${id}`, { text, url });
    return response.data;
  },

  // Delete link
  deleteLink: async (id: number): Promise<void> => {
    await api.delete(`/links/${id}`);
  },

  // Reorder links
  reorderLinks: async (links: any[]): Promise<void> => {
    await api.put("/links/reorder", { links });
  },
};

export const authApi = {
  // Login
  login: async (password: string): Promise<boolean> => {
    try {
      const response = await api.post("/auth", { password });
      if (response.data.success) {
        localStorage.setItem("admin_token", password);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("admin_token");
  },

  // Check if logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("admin_token");
  },
};
