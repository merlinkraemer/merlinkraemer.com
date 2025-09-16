import React, { useState } from "react";
import { galleryApi } from "@/services/api";

interface ImageUploadProps {
  onImageAdded: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageAdded }) => {
  const [formData, setFormData] = useState({
    image: null as File | null,
    alt: "",
    description: "",
    category: "finished" as "finished" | "wip",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, image: file }));
      } else {
        setError("Please drop an image file");
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      setError("Please select an image file");
      return;
    }

    if (!formData.alt || !formData.description) {
      setError("Please fill in all required fields");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("image", formData.image);
      uploadData.append("alt", formData.alt);
      uploadData.append("description", formData.description);
      uploadData.append("category", formData.category);
      uploadData.append("year", new Date().getFullYear().toString());

      await galleryApi.addImage(uploadData);

      // Reset form
      setFormData({
        image: null,
        alt: "",
        description: "",
        category: "finished",
      });

      // Clear file input
      const fileInput = document.getElementById("image") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      onImageAdded();
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "1.6" }}
    >
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>ERROR:</strong> {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {/* Drag and Drop Area */}
        <div
          style={{
            flex: "0 0 300px",
            minWidth: "280px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: dragActive ? "2px dashed #007bff" : "2px dashed #ccc",
              borderRadius: "8px",
              padding: "40px 20px",
              textAlign: "center",
              backgroundColor: dragActive ? "#f0f8ff" : "#f9f9f9",
              cursor: "pointer",
              flex: "1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => document.getElementById("image")?.click()}
          >
            {formData.image ? (
              <div>
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "150px",
                    objectFit: "contain",
                    marginBottom: "10px",
                  }}
                />
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                  {formData.image.name}
                </p>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "11px",
                    color: "#999",
                  }}
                >
                  Click or drag to change
                </p>
              </div>
            ) : (
              <div>
                <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                  Drop image here
                </p>
                <p style={{ margin: "0", fontSize: "11px", color: "#666" }}>
                  or click to browse
                </p>
              </div>
            )}
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              required
            />
          </div>
        </div>

        {/* Form Inputs */}
        <div
          style={{
            flex: "1",
            minWidth: "280px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div style={{ flex: "1" }}>
              <label
                htmlFor="alt"
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                Alt Text *
              </label>
              <input
                id="alt"
                name="alt"
                type="text"
                value={formData.alt}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "8px",
                  marginBottom: "15px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
                placeholder="e.g., Cozy Bed"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "8px",
                  marginBottom: "15px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
                placeholder="e.g., 56x42cm, Acryl, Pastel auf Holz - 50€"
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="category"
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              >
                <option value="finished">Finished</option>
                <option value="wip">WIP</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={uploading}
              style={{
                width: "100%",
                height: "40px",
                padding: "10px",
                border: "1px solid #ccc",
                marginTop: "auto",
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
