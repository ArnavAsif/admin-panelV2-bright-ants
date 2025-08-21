/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../auth/AuthProvider';

const API = "https://bright-ants-backend.onrender.com";

const PromotionalOffers = () => {
  const { token } = useAuth();
  const [offers, setOffers] = useState([]);

  const [form, setForm] = useState({
    id: null,
    title: '',
    description: '',
    images: { image1: null, image2: null, image3: null },
    existingImages: ['', '', ''],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API}/promotional-offers`);
      const data = await res.json();
      setOffers(data.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load offers", "error");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name.startsWith('image')) {
      setForm({
        ...form,
        images: { ...form.images, [name]: files[0] || null },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      description: '',
      images: { image1: null, image2: null, image3: null },
      existingImages: ['', '', ''],
    });
    setIsEditing(false);
  };

  const handleRemoveExistingImage = (index) => {
    const updatedExisting = [...form.existingImages];
    updatedExisting[index] = '';
    const updatedImages = { ...form.images };
    updatedImages[`image${index + 1}`] = null;

    setForm({
      ...form,
      existingImages: updatedExisting,
      images: updatedImages,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent adding new offers beyond limit
    if (!isEditing && offers.length >= 4) {
      return Swal.fire("Limit Reached", "You can only have a maximum of 4 promotional offers.", "warning");
    }

    if (!form.title || !form.description) {
      return Swal.fire("Warning", "Please fill in all fields", "warning");
    }

    try {
      setIsLoading(true);

      let imageNames = form.existingImages.filter(Boolean);

      const formData = new FormData();
      let hasNewImage = false;

      Object.values(form.images).forEach((img) => {
        if (img) {
          formData.append('file', img);
          hasNewImage = true;
        }
      });

      if (hasNewImage) {
        const uploadRes = await fetch(`${API}/files`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");

        const uploadData = await uploadRes.json();
        const uploadedImageNames = uploadData.files.map(file => file.name);
        imageNames = [...imageNames, ...uploadedImageNames];
      }

      const payload = {
        title: form.title,
        description: form.description,
        images: imageNames,
      };

      const method = isEditing ? 'PATCH' : 'POST';
      const endpoint = isEditing
        ? `${API}/promotional-offers/${form.id}`
        : `${API}/promotional-offers`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save promotional offer");

      Swal.fire("Success", isEditing ? "Offer updated" : "Offer added", "success");
      resetForm();
      fetchOffers();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (offer) => {
    setForm({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      images: { image1: null, image2: null, image3: null },
      existingImages: offer.images.length === 3 ? offer.images : [
        offer.images[0] || '',
        offer.images[1] || '',
        offer.images[2] || '',
      ],
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This offer will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API}/promotional-offers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Offer has been deleted.", "success");
          fetchOffers();
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Promotional Offers Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 mb-10 space-y-4">
        {!isEditing && offers.length >= 4 && (
          <div className="text-red-600 font-semibold">
            Maximum of 4 offers allowed. Please delete an existing one to add a new offer.
          </div>
        )}

        <input
          type="text"
          name="title"
          placeholder="Offer Title"
          className="input input-bordered w-full"
          value={form.title}
          onChange={handleChange}
          required
          disabled={!isEditing && offers.length >= 4}
        />
        <textarea
          name="description"
          placeholder="Offer Description"
          className="textarea textarea-bordered w-full"
          value={form.description}
          onChange={handleChange}
          required
          disabled={!isEditing && offers.length >= 4}
        />

        {[1, 2, 3].map((num) => {
          const existingImage = form.existingImages[num - 1];
          const newImage = form.images[`image${num}`];
          return (
            <div key={num}>
              <label className="block font-medium mb-1">Image {num}</label>
              <input
                type="file"
                name={`image${num}`}
                className="file-input file-input-bordered w-full"
                onChange={handleChange}
                accept="image/*"
                disabled={!isEditing && offers.length >= 4}
              />
              {existingImage && !newImage && (
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={`${API}/files/${existingImage}`}
                    alt={`Existing Image ${num}`}
                    className="w-24 h-24 object-cover rounded border"
                    onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(num - 1)}
                    className="btn btn-sm btn-error"
                  >
                    Remove
                  </button>
                </div>
              )}
              {newImage && (
                <div className="mt-1">
                  <img
                    src={URL.createObjectURL(newImage)}
                    alt={`Selected Image ${num}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          );
        })}

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || (!isEditing && offers.length >= 4)}
          >
            {isEditing ? "Update Offer" : "Add Offer"}
          </button>
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List of offers */}
      <div className="grid gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white shadow rounded p-4 flex flex-col gap-4">
            <div className="flex gap-2">
              {(offer.images || []).map((img, idx) => (
                <img
                  key={idx}
                  src={`${API}/files/${img}`}
                  alt={`${offer.title} ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                />
              ))}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{offer.title}</h2>
              <p className="mt-2">{offer.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(offer)} className="btn btn-sm btn-info">Edit</button>
              <button onClick={() => handleDelete(offer.id)} className="btn btn-sm btn-error">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalOffers;
