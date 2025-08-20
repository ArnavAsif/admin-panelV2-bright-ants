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
    image: null, // File object
    existingImage: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all offers
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
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      description: '',
      image: null,
      existingImage: null
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.title || !form.description) {
    return Swal.fire("Warning", "Please fill in all fields", "warning");
  }

  try {
    setIsLoading(true);

    let imageName = form.existingImage;

    if (form.image instanceof File) {
      const formData = new FormData();
      formData.append('file', form.image);

      const uploadRes = await fetch(`${API}/files`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");

      const uploadData = await uploadRes.json();
      imageName = uploadData.files[0].name;
    }

    const payload = {
      title: form.title,
      description: form.description,
      images: imageName ? [imageName] : []
    };

    const method = isEditing ? 'PATCH' : 'POST';
    const endpoint = isEditing
      ? `${API}/promotional-offers/${form.id}`
      : `${API}/promotional-offers`;

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
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
      image: null,
      existingImage: offer.images?.[0] || null
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
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API}/promotional-offers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
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
        <input
          type="text"
          name="title"
          placeholder="Offer Title"
          className="input input-bordered w-full"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Offer Description"
          className="textarea textarea-bordered w-full"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="image"
          className="file-input file-input-bordered w-full"
          onChange={handleChange}
          accept="image/*"
        />

        {form.existingImage && isEditing && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Current Image:</p>
            <img
              src={`${API}/files/${form.existingImage}`}
              alt="Existing"
              className="w-32 h-32 object-cover rounded border"
              onError={(e) => (e.target.src = '/placeholder-image.jpg')}
            />
          </div>
        )}

        <div className="flex gap-4">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isEditing ? "Update Offer" : "Add Offer"}
          </button>
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="grid gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white shadow rounded p-4 flex gap-4 items-start">
            <img
              src={`${API}/files/${offer.images?.[0]}`}
              alt={offer.title}
              className="w-24 h-24 object-cover rounded"
              onError={(e) => (e.target.src = "/placeholder-image.jpg")}
            />
            <div className="flex-grow">
              <h2 className="text-xl font-semibold">{offer.title}</h2>
              <p className="mt-2">{offer.description}</p>
            </div>
            <div className="flex flex-col gap-2">
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
