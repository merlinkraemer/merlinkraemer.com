import React, { useState, useEffect } from "react";
import { authApi } from "@/services/api";
import { useGalleryContext } from "@/contexts/GalleryContext";
import type { GalleryImage } from "@/types/gallery";
import LoginForm from "@/components/admin/LoginForm";
import AdminLayout from "@/components/admin/AdminLayout";
import ImageUpload from "@/components/admin/ImageUpload";
import ImageList from "@/components/admin/ImageList";

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {
    galleryData,
    loading,
    error,
    refreshGallery,
    updateImage,
    deleteImage,
    addImage,
    reorderImages,
  } = useGalleryContext();
  const [links, setLinks] = useState([
    {
      id: 1,
      text: "@ OA 26-07-2025 - liveset",
      url: "https://soundcloud.com/merlin040/oa-260725",
    },
    {
      id: 2,
      text: '"Live aus der Werkstatt 1" - Mix',
      url: "https://soundcloud.com/merlin040/live-aus-der-werkstatt-1",
    },
    {
      id: 3,
      text: '"Keys Don\'t Match" - Stimming, Dominique Fricot - Merlin Remix',
      url: "https://soundcloud.com/merlin040/keys-dont-match-remix",
    },
    {
      id: 4,
      text: "@ Studio Boschstraße 20.04.2025 - Mix",
      url: "https://soundcloud.com/merlin040/set-20042025",
    },
    {
      id: 5,
      text: '"Der starke Wanja" EP',
      url: "https://soundcloud.com/merlin040/sets/wanja",
    },
    { id: 6, text: "SoundCloud 🎶", url: "https://soundcloud.com/merlin040" },
    {
      id: 7,
      text: "Bandcamp (Sunset Records) 🌞",
      url: "https://sunsetrecords-040.bandcamp.com/",
    },
    { id: 8, text: "Instagram 🎨", url: "https://instagram.com/merlinkraemer" },
    { id: 9, text: "TikTok", url: "https://www.tiktok.com/@merlinsroom" },
    { id: 10, text: "YouTube", url: "https://www.youtube.com/@merlins-room" },
    { id: 11, text: "Twitch", url: "https://www.twitch.tv/merlinsroom" },
  ]);
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    if (authApi.isLoggedIn()) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (password: string) => {
    const success = await authApi.login(password);
    if (success) {
      setIsLoggedIn(true);
      await refreshGallery();
    } else {
      setError("Invalid password");
    }
  };

  const handleLogout = () => {
    authApi.logout();
    setIsLoggedIn(false);
  };

  const handleLinkTextChange = (id: number, newText: string) => {
    setLinks(
      links.map((link) => (link.id === id ? { ...link, text: newText } : link))
    );
  };

  const handleLinkUrlChange = (id: number, newUrl: string) => {
    setLinks(
      links.map((link) => (link.id === id ? { ...link, url: newUrl } : link))
    );
  };

  const handleDeleteLink = (id: number) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleAddLink = () => {
    if (newLinkText.trim() && newLinkUrl.trim()) {
      const newId = Math.max(...links.map((l) => l.id)) + 1;
      setLinks([...links, { id: newId, text: newLinkText, url: newLinkUrl }]);
      setNewLinkText("");
      setNewLinkUrl("");
    }
  };

  const handleEditLink = (id: number) => {
    setEditingLinkId(id);
  };

  const handleSaveLink = () => {
    setEditingLinkId(null);
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
  };

  const handleImageAdded = async (image: GalleryImage) => {
    addImage(image);
  };

  const handleImageUpdated = async (
    id: string,
    updates: Partial<GalleryImage>
  ) => {
    updateImage(id, updates);
  };

  const handleImageDeleted = async (id: string) => {
    deleteImage(id);
  };

  const handleImageReordered = (reorderedImages: GalleryImage[]) => {
    reorderImages(reorderedImages);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} error={error} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <style>
        {`
          @media (max-width: 768px) {
            .link-row {
              flex-direction: column !important;
            }
            .link-input {
              width: 100% !important;
              min-width: unset !important;
            }
            .link-buttons {
              display: flex !important;
              gap: 10px !important;
            }
            .link-button {
              flex: 1 !important;
            }
            .image-item {
              flex-direction: column !important;
            }
            .image-preview {
              width: 100% !important;
              height: 200px !important;
              margin-bottom: 10px !important;
            }
            .image-info {
              width: 100% !important;
              margin-bottom: 10px !important;
            }
            .image-actions {
              display: flex !important;
              gap: 10px !important;
              width: 100% !important;
            }
            .image-action-button {
              flex: 1 !important;
            }
          }
        `}
      </style>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "30px",
            padding: "10px",
            border: "1px solid red",
          }}
        >
          <strong>ERROR:</strong> {error}
        </div>
      )}

      {/* Links Management */}
      <div style={{ marginBottom: "50px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div
            className="link-row"
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Link text"
              value={newLinkText}
              onChange={(e) => setNewLinkText(e.target.value)}
              className="link-input"
              style={{
                flex: "1",
                minWidth: "200px",
                padding: "8px",
                border: "1px solid #ccc",
              }}
            />
            <input
              type="url"
              placeholder="URL"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="link-input"
              style={{
                flex: "1",
                minWidth: "200px",
                padding: "8px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleAddLink}
              className="link-button"
              style={{
                padding: "8px 15px",
                border: "1px solid #ccc",
                flexShrink: "0",
              }}
            >
              Add
            </button>
          </div>
        </div>
        <div>
          {links.map((link) => (
            <div key={link.id} style={{ marginBottom: "15px" }}>
              {editingLinkId === link.id ? (
                <div
                  className="link-row"
                  style={{
                    display: "flex",
                    gap: "10px",
                    width: "100%",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) =>
                      handleLinkTextChange(link.id, e.target.value)
                    }
                    className="link-input"
                    style={{
                      flex: "1",
                      minWidth: "200px",
                      padding: "8px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      handleLinkUrlChange(link.id, e.target.value)
                    }
                    className="link-input"
                    style={{
                      flex: "1",
                      minWidth: "200px",
                      padding: "8px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <div
                    className="link-buttons"
                    style={{
                      display: "flex",
                      gap: "10px",
                      flex: "1",
                      minWidth: "200px",
                    }}
                  >
                    <button
                      onClick={handleSaveLink}
                      className="link-button"
                      style={{
                        flex: "1",
                        padding: "8px 15px",
                        border: "1px solid #ccc",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="link-button"
                      style={{
                        flex: "1",
                        padding: "8px 15px",
                        border: "1px solid #ccc",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="link-button"
                      style={{
                        flex: "1",
                        color: "red",
                        padding: "8px 15px",
                        border: "1px solid #ccc",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="link-row"
                  style={{
                    display: "flex",
                    gap: "10px",
                    width: "100%",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="link-input"
                    style={{
                      flex: "1",
                      minWidth: "200px",
                      padding: "8px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    {link.text}
                  </span>
                  <span
                    className="link-input"
                    style={{
                      flex: "1",
                      minWidth: "200px",
                      padding: "8px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    {link.url}
                  </span>
                  <div
                    className="link-buttons"
                    style={{
                      display: "flex",
                      gap: "10px",
                      flex: "1",
                      minWidth: "200px",
                    }}
                  >
                    <button
                      onClick={() => handleEditLink(link.id)}
                      disabled={editingLinkId !== null}
                      className="link-button"
                      style={{
                        flex: "1",
                        padding: "8px 15px",
                        border: "1px solid #ccc",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="link-button"
                      style={{
                        flex: "1",
                        color: "red",
                        padding: "8px 15px",
                        border: "1px solid #ccc",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div
        style={{
          borderTop: "2px solid #ccc",
          margin: "30px 0",
          width: "100%",
        }}
      ></div>

      {/* Add New Image */}
      <div style={{ marginBottom: "50px" }}>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <ImageUpload onImageAdded={handleImageAdded} />
        </div>
      </div>

      {/* Gallery Images - Finished */}
      <div style={{ marginBottom: "50px" }}>
        <ImageList
          images={galleryData.finished}
          onImageUpdated={handleImageUpdated}
          onImageDeleted={handleImageDeleted}
          onImageReordered={handleImageReordered}
        />
      </div>

      {/* Gallery Images - WIP */}
      <div style={{ marginBottom: "50px" }}>
        <ImageList
          images={galleryData.wip}
          onImageUpdated={handleImageUpdated}
          onImageDeleted={handleImageDeleted}
          onImageReordered={handleImageReordered}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
