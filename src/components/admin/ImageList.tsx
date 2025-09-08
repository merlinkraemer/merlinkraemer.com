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
    year: 0,
    width: 1,
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
      year: image.year,
      width: image.width,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      alt: "",
      description: "",
      category: "finished",
      year: 0,
      width: 1,
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
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: "1px solid #ccc",
        margin: "15px 0",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
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
        }}
        title="Drag to reorder"
      >
        ≡
      </div>

      <div
        style={{
          width: "100px",
          height: "100px",
          border: "1px solid #ccc",
        }}
      >
        <img
          src={image.src}
          alt={image.alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {editingId === image.id ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <div style={{ display: "flex", gap: "15px" }}>
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
                  flex: 1,
                  height: "40px",
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="number"
                value={editForm.year}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    year: parseInt(e.target.value),
                  }))
                }
                min="2020"
                max="2030"
                style={{
                  width: "80px",
                  height: "40px",
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description"
              rows={2}
              style={{
                height: "60px",
                padding: "8px",
                border: "1px solid #ccc",
              }}
            />
            <div style={{ display: "flex", gap: "15px" }}>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    category: e.target.value as "finished" | "wip",
                  }))
                }
                style={{
                  flex: 1,
                  height: "40px",
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="finished">Finished</option>
                <option value="wip">WIP</option>
              </select>
              <select
                value={editForm.width}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    width: parseInt(e.target.value),
                  }))
                }
                style={{
                  width: "80px",
                  height: "40px",
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              >
                <option value={1}>1 col</option>
                <option value={2}>2 col</option>
                <option value={3}>3 col</option>
                <option value={4}>4 col</option>
                <option value={5}>5 col</option>
                <option value={6}>6 col</option>
                <option value={7}>7 col</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => handleEditSubmit(image.id)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              >
                Cancel
              </button>
            </div>
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
              <span>|</span>
              <span style={{ margin: "0 5px" }}>{image.year}</span>
              <span>|</span>
              <span
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  padding: "2px 5px",
                  marginLeft: "5px",
                }}
              >
                {image.width}
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => startEdit(image)}
          style={{
            padding: "8px 15px",
            border: "1px solid #ccc",
          }}
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(image.id)}
          disabled={deletingId === image.id}
          style={{ padding: "8px 15px", color: "red" }}
        >
          {deletingId === image.id ? "Deleting..." : "Delete"}
        </button>
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
          galleryApi.updateImage(image.id, { order: index })
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
