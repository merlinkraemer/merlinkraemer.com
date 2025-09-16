import React, { useState, useEffect } from "react";
import { authApi, linkApi } from "@/services/api";
import { useGalleryContext } from "@/contexts/GalleryContext";
import type { GalleryImage } from "@/types/gallery";
import LoginForm from "@/components/admin/LoginForm";
import AdminLayout from "@/components/admin/AdminLayout";
import ImageUpload from "@/components/admin/ImageUpload";
import ImageList from "@/components/admin/ImageList";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Link {
  id: number;
  text: string;
  url: string;
}

interface SortableLinkProps {
  link: Link;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onTextChange: (id: number, text: string) => void;
  onUrlChange: (id: number, url: string) => void;
}

const SortableLink: React.FC<SortableLinkProps> = ({
  link,
  onSave,
  onDelete,
  onTextChange,
  onUrlChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: "move",
          padding: "5px",
          border: "1px solid #ccc",
          backgroundColor: "#f0f0f0",
          userSelect: "none",
          flexShrink: 0,
        }}
        title="Drag to reorder"
      >
        ≡
      </div>

      <div
        className="link-row"
        style={{
          display: "flex",
          gap: "10px",
          width: "100%",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={link.text}
          onChange={(e) => onTextChange(link.id, e.target.value)}
          className="link-input"
          style={{
            flex: "1",
            minWidth: "200px",
            padding: "8px",
            border: "1px solid #ccc",
            height: "40px",
            boxSizing: "border-box",
          }}
        />
        <input
          type="url"
          value={link.url}
          onChange={(e) => onUrlChange(link.id, e.target.value)}
          className="link-input"
          style={{
            flex: "1",
            minWidth: "250px",
            padding: "8px",
            border: "1px solid #ccc",
            height: "40px",
            boxSizing: "border-box",
          }}
        />
        <div
          className="link-buttons"
          style={{
            display: "flex",
            gap: "10px",
            flexShrink: "0",
          }}
        >
          <button
            onClick={() => onSave(link.id)}
            className="link-button"
            style={{
              padding: "8px 15px",
              border: "1px solid #ccc",
              whiteSpace: "nowrap",
            }}
          >
            Save
          </button>
          <button
            onClick={() => onDelete(link.id)}
            className="link-button"
            style={{
              color: "red",
              padding: "8px 15px",
              border: "1px solid #ccc",
              whiteSpace: "nowrap",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { galleryData, loading, error, refreshGallery, reorderImages } =
    useGalleryContext();
  const [links, setLinks] = useState<Link[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Check if user is already logged in
    if (authApi.isLoggedIn()) {
      setIsLoggedIn(true);
    }
  }, []);

  // Load links from API
  const loadLinks = async () => {
    try {
      setLinksLoading(true);
      const linksData = await linkApi.getLinks();
      setLinks(linksData);
    } catch (error) {
      console.error("Error loading links:", error);
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadLinks();
    }
  }, [isLoggedIn]);

  const handleLogin = async (password: string) => {
    const success = await authApi.login(password);
    if (success) {
      setIsLoggedIn(true);
      await refreshGallery();
    } else {
      // Login failed - the LoginForm component will handle showing the error
      console.error("Login failed");
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

  const handleDeleteLink = async (id: number) => {
    try {
      await linkApi.deleteLink(id);
      setLinks(links.filter((link) => link.id !== id));
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const handleAddLink = async () => {
    if (newLinkText.trim() && newLinkUrl.trim()) {
      try {
        const newLink = await linkApi.createLink(newLinkText, newLinkUrl);
        setLinks([...links, newLink]);
        setNewLinkText("");
        setNewLinkUrl("");
      } catch (error) {
        console.error("Error creating link:", error);
      }
    }
  };

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

  const handleSaveLink = async (id: number) => {
    console.log("handleSaveLink called with id:", id);
    const link = links.find((l) => l.id === id);
    console.log("Found link:", link);
    if (link) {
      try {
        console.log(
          "Calling linkApi.updateLink with:",
          link.id,
          link.text,
          link.url
        );
        const result = await linkApi.updateLink(link.id, link.text, link.url);
        console.log("Update result:", result);
      } catch (error) {
        console.error("Error updating link:", error);
      }
    }
  };

  const handleLinkDragEnd = async (event: DragEndEvent) => {
    console.log("handleLinkDragEnd called with event:", event);
    const { active, over } = event;

    if (active.id !== over?.id) {
      console.log("Reordering from", active.id, "to", over?.id);

      // Find which section the active item belongs to
      const activeItem = links.find((item) => item.id === active.id);
      const overItem = links.find((item) => item.id === over?.id);

      if (!activeItem || !overItem) {
        console.error("Could not find active or over item");
        return;
      }

      // Check if both items are in the same section
      const activeIsRegular = regularLinks.some(
        (link) => link.id === active.id
      );
      const overIsRegular = regularLinks.some((link) => link.id === over?.id);

      if (activeIsRegular !== overIsRegular) {
        console.log("Cross-section drag - moving between regular and social");
        // Cross-section drag - move the item to the other section
        const newLinks = [...links];
        const activeIndex = newLinks.findIndex((item) => item.id === active.id);
        const overIndex = newLinks.findIndex((item) => item.id === over?.id);

        // Remove active item and insert it at the over position
        const [movedItem] = newLinks.splice(activeIndex, 1);
        newLinks.splice(overIndex, 0, movedItem);

        setLinks(newLinks);

        try {
          console.log("Calling linkApi.reorderLinks for cross-section move");
          await linkApi.reorderLinks(newLinks);
          console.log("Cross-section reorder successful");
        } catch (error) {
          console.error("Error reordering links:", error);
          setLinks(links);
        }
      } else {
        console.log("Same-section drag - reordering within section");
        // Same-section drag - reorder within the section
        const newLinks = arrayMove(
          links,
          links.findIndex((item) => item.id === active.id),
          links.findIndex((item) => item.id === over?.id)
        );

        console.log("New links order:", newLinks);
        setLinks(newLinks);

        try {
          console.log("Calling linkApi.reorderLinks for same-section move");
          await linkApi.reorderLinks(newLinks);
          console.log("Same-section reorder successful");
        } catch (error) {
          console.error("Error reordering links:", error);
          setLinks(links);
        }
      }
    }
  };

  const handleImageAdded = async () => {
    // The ImageUpload component handles the API call and calls this callback
    // We just need to refresh the gallery to get the latest data
    await refreshGallery();
  };

  const handleImageUpdated = async () => {
    // The ImageList component handles the API call and calls this callback
    // We just need to refresh the gallery to get the latest data
    await refreshGallery();
  };

  const handleImageDeleted = async () => {
    // The ImageList component handles the API call and calls this callback
    // We just need to refresh the gallery to get the latest data
    await refreshGallery();
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
          /* Desktop styles */
          .image-item {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #fafafa;
            margin: 15px 0;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
          }
          
          .drag-handle {
            cursor: move;
            padding: 5px;
            border: 1px solid #ccc;
            background-color: #f0f0f0;
            user-select: none;
            display: flex;
            justify-content: center;
            max-width: 2rem;
          }
          
          .image-preview {
            width: 100px;
            height: 100px;
          }
          
          .image-preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .image-info {
            flex: 1;
            min-width: 0;
          }
          
          .image-actions {
            display: flex;
            gap: 10px;
          }
          
          @media (max-width: 768px) {
            .link-row {
              flex-direction: column !important;
            }
            .link-input {
              width: 100% !important;
              min-width: unset !important;
              height: 40px !important;
              padding: 8px !important;
              font-size: 14px !important;
              border: 1px solid #ccc !important;
              border-radius: 4px !important;
              box-sizing: border-box !important;
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
            .drag-handle {
              display: flex !important;
              justify-content: center !important;
              max-width: 2rem !important;
            }
            .image-preview {
              width: 100% !important;
              height: 200px !important;
              margin-bottom: 15px !important;
            }
            .image-preview img {
              width: 100% !important;
              max-width: none !important;
            }
            .image-info {
              width: 100% !important;
              margin-bottom: 15px !important;
            }
            .image-actions {
              width: 100% !important;
              display: flex !important;
              gap: 10px !important;
            }
            .image-action-button {
              flex: 1 !important;
            }
            .edit-form {
              display: flex !important;
              flex-direction: column !important;
              gap: 15px !important;
            }
            .edit-form input,
            .edit-form textarea,
            .edit-form select {
              width: 100% !important;
              height: 40px !important;
              padding: 8px !important;
              font-size: 14px !important;
              border: 1px solid #ccc !important;
              border-radius: 4px !important;
              box-sizing: border-box !important;
            }
            .edit-form textarea {
              height: 60px !important;
              resize: vertical !important;
            }
            .edit-form .form-actions {
              display: flex !important;
              gap: 10px !important;
              width: 100% !important;
            }
            .edit-form .form-actions button {
              flex: 1 !important;
              height: 40px !important;
              padding: 8px 16px !important;
              font-size: 14px !important;
              border: 1px solid #ccc !important;
              border-radius: 4px !important;
              background: #f5f5f5 !important;
              cursor: pointer !important;
              box-sizing: border-box !important;
            }
            .edit-form .form-actions button.primary {
              background: #007bff !important;
              color: white !important;
              border-color: #007bff !important;
            }
            .edit-form .form-actions button.danger {
              background: #dc3545 !important;
              color: white !important;
              border-color: #dc3545 !important;
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
        <h2
          style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "bold" }}
        >
          Links
        </h2>
        <div style={{ marginBottom: "20px" }}>
          <div
            className="link-row"
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              width: "100%",
              flexWrap: "wrap",
              alignItems: "flex-start",
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
                minWidth: "150px",
                padding: "8px",
                border: "1px solid #ccc",
                height: "40px",
                boxSizing: "border-box",
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
                minWidth: "150px",
                padding: "8px",
                border: "1px solid #ccc",
                height: "40px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleAddLink}
              className="link-button"
              style={{
                padding: "8px 15px",
                border: "1px solid #ccc",
                flexShrink: "0",
                whiteSpace: "nowrap",
              }}
            >
              Add Link
            </button>
          </div>
        </div>
        {linksLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Loading links...
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLinkDragEnd}
          >
            <SortableContext
              items={links.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                <h3
                  style={{
                    marginBottom: "10px",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Regular Links
                </h3>
                {regularLinks.map((link) => (
                  <SortableLink
                    key={link.id}
                    link={link}
                    onSave={handleSaveLink}
                    onDelete={handleDeleteLink}
                    onTextChange={handleLinkTextChange}
                    onUrlChange={handleLinkUrlChange}
                  />
                ))}

                <h3
                  style={{
                    marginTop: "20px",
                    marginBottom: "10px",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Social Media
                </h3>
                {socialLinks.map((link) => (
                  <SortableLink
                    key={link.id}
                    link={link}
                    onSave={handleSaveLink}
                    onDelete={handleDeleteLink}
                    onTextChange={handleLinkTextChange}
                    onUrlChange={handleLinkUrlChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
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
        <h2
          style={{
            marginBottom: "20px",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          Finished
        </h2>
        <ImageList
          images={galleryData.finished}
          onImageUpdated={handleImageUpdated}
          onImageDeleted={handleImageDeleted}
          onImageReordered={handleImageReordered}
        />
      </div>

      {/* Gallery Images - WIP */}
      <div style={{ marginBottom: "50px" }}>
        <h2
          style={{
            marginBottom: "20px",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          WIP
        </h2>
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
