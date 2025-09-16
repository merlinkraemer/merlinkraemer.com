import React, { useState } from "react";
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
import type { GalleryImage } from "@/types/gallery";
import { galleryApi } from "@/services/api";

interface ImageListProps {
  images: GalleryImage[];
  onImageUpdated: () => void;
  onImageDeleted: () => void;
  onImageReordered: (images: GalleryImage[]) => void;
}

interface SortableImageItemProps {
  image: GalleryImage;
  onImageUpdated: () => void;
  onImageDeleted: () => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({
  image,
  onImageUpdated,
  onImageDeleted,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    alt: "",
    description: "",
    category: "finished" as "finished" | "wip",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const startEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setEditForm({
      alt: image.alt,
      description: image.description,
      category: image.category,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      alt: "",
      description: "",
      category: "finished",
    });
  };

  const handleEditSubmit = async (id: string) => {
    try {
      await galleryApi.updateImage(id, editForm);
      setEditingId(null);
      onImageUpdated();
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Failed to update image");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this image? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      await galleryApi.deleteImage(id);
      onImageDeleted();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div ref={setNodeRef} className="image-item" style={style}>
      <div
        {...attributes}
        {...listeners}
        className="drag-handle"
        title="Drag to reorder"
      >
        ≡
      </div>

      <div className="image-preview">
        <img src={image.src} alt={image.alt} className="image-preview-img" />
      </div>

      <div className="image-info">
        {editingId === image.id ? (
          <div
            className="edit-form"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={editForm.alt}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  alt: e.target.value,
                }))
              }
              placeholder="Alt text"
              style={{
                width: "100%",
                height: "40px",
                padding: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description"
              rows={1}
              style={{
                width: "100%",
                height: "40px",
                padding: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  category: e.target.value as "finished" | "wip",
                }))
              }
              style={{
                width: "100%",
                height: "40px",
                padding: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              <option value="finished">Finished</option>
              <option value="wip">WIP</option>
            </select>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              {image.alt}
            </div>
            <div style={{ marginBottom: "10px", fontSize: "13px" }}>
              {image.description}
            </div>
            <div style={{ fontSize: "12px" }}>
              <span
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "2px 5px",
                  marginRight: "5px",
                }}
              >
                {image.category}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="image-actions" style={{ display: "flex", gap: "10px" }}>
        {editingId === image.id ? (
          <div className="form-actions">
            <button
              className="primary"
              onClick={() => handleEditSubmit(image.id)}
              style={{
                padding: "8px 15px",
                border: "1px solid #ccc",
                backgroundColor: "#007bff",
                color: "white",
              }}
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              style={{
                padding: "8px 15px",
                border: "1px solid #ccc",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              className="image-action-button"
              onClick={() => startEdit(image)}
              style={{
                padding: "8px 15px",
                border: "1px solid #ccc",
              }}
            >
              Edit
            </button>
            <button
              className="image-action-button danger"
              onClick={() => handleDelete(image.id)}
              disabled={deletingId === image.id}
              style={{ padding: "8px 15px", color: "red" }}
            >
              {deletingId === image.id ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ImageList: React.FC<ImageListProps> = ({
  images,
  onImageUpdated,
  onImageDeleted,
  onImageReordered,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((item) => item.id === active.id);
      const newIndex = images.findIndex((item) => item.id === over.id);

      const reorderedImages = arrayMove(images, oldIndex, newIndex);

      // Update order in database
      try {
        const updatePromises = reorderedImages.map((image, index) =>
          galleryApi.updateImage(image.id, { order: index * 10 })
        );
        await Promise.all(updatePromises);

        // Update local state
        onImageReordered(reorderedImages);
      } catch (error) {
        console.error("Error reordering images:", error);
        alert("Failed to reorder images");
      }
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No images in this category yet.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map((img) => img.id)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ marginBottom: "20px" }}>
          {images.map((image) => (
            <SortableImageItem
              key={image.id}
              image={image}
              onImageUpdated={onImageUpdated}
              onImageDeleted={onImageDeleted}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ImageList;
