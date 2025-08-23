/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/AuthProvider";

const API = "https://bright-ants-backend.onrender.com";

// Helper to split backend description into two parts
const splitDescription = (description) => {
  if (!description) return ["", ""];
  const parts = description.split("|||");
  return [parts[0] || "", parts[1] || ""];
};

const Offers = () => {
  const { token } = useAuth();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: "",
    description1: "",
    description2: "",
    price: "",
  });

  // Fetch offers and split descriptions
  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API}/offers`);
      const data = await res.json();
      const processedOffers = (data.data || []).map((offer) => {
        const [description1, description2] = splitDescription(offer.description);
        return { ...offer, description1, description2 };
      });
      setOffers(processedOffers);
    } catch (err) {
      Swal.fire("Error", "Failed to load offers", "error");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Handle input change for new offer
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOffer((prev) => ({ ...prev, [name]: value }));
  };

  // Add new offer
  const handleAdd = async () => {
    const { title, description1, description2, price } = newOffer;

    if (!title || !description1 || !description2 || !price) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }

    if (offers.length >= 3) {
      Swal.fire("Error", "Maximum of 3 offers allowed", "error");
      return;
    }

    try {
      setIsLoading(true);
      const combinedDescription = `${description1}|||${description2}`;

      const res = await fetch(`${API}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description: combinedDescription, price: Number(price) }),
      });

      if (!res.ok) throw new Error("Failed to add offer");

      Swal.fire("Success", "Offer added", "success");
      setNewOffer({ title: "", description1: "", description2: "", price: "" });
      fetchOffers();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Update offer
  const handleEdit = async (offerId, updatedOffer) => {
    try {
      setIsLoading(true);
      const combinedDescription = `${updatedOffer.description1}|||${updatedOffer.description2}`;

      const res = await fetch(`${API}/offers/${offerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updatedOffer.title,
          description: combinedDescription,
          price: Number(updatedOffer.price),
        }),
      });

      if (!res.ok) throw new Error("Failed to update offer");

      Swal.fire("Success", "Offer updated", "success");
      fetchOffers();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete offer
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
          await fetch(`${API}/offers/${id}`, {
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
      <h1 className="text-2xl font-bold mb-6">Offer Management</h1>

      {/* Add New Offer or Limit Message */}
      {offers.length >= 3 ? (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded">
          Maximum of 3 offers reached. Please delete an offer to add a new one.
        </div>
      ) : (
        <div className="mb-6 space-y-2">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newOffer.title}
            onChange={handleChange}
            className="input input-bordered w-full"
            disabled={isLoading}
          />
          <input
            type="text"
            name="description1"
            placeholder="Description Part 1"
            value={newOffer.description1}
            onChange={handleChange}
            className="input input-bordered w-full"
            disabled={isLoading}
          />
          <input
            type="text"
            name="description2"
            placeholder="Description Part 2"
            value={newOffer.description2}
            onChange={handleChange}
            className="input input-bordered w-full"
            disabled={isLoading}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newOffer.price}
            onChange={handleChange}
            className="input input-bordered w-full"
            disabled={isLoading}
          />
          <button
            onClick={handleAdd}
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Offer"}
          </button>
        </div>
      )}

      {/* Offer List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <OfferItem
            key={offer.id}
            offer={offer}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

const OfferItem = ({ offer, onEdit, onDelete, isLoading }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(() => ({
    title: offer.title,
    description1: offer.description1 || "",
    description2: offer.description2 || "",
    price: offer.price,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    if (!formData.title || !formData.description1 || !formData.description2 || !formData.price) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }
    onEdit(offer.id, formData);
    setEditMode(false);
  };

  return (
    <div className="bg-white shadow p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1">
        {editMode ? (
          <div className="space-y-2">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
            <input
              type="text"
              name="description1"
              value={formData.description1}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={isLoading}
              placeholder="Description Part 1"
            />
            <input
              type="text"
              name="description2"
              value={formData.description2}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={isLoading}
              placeholder="Description Part 2"
            />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold">{offer.title}</p>
            <p className="text-gray-600">{offer.description1}</p>
            <p className="text-gray-600">{offer.description2}</p>
            <p className="text-sm text-gray-500">Price: ${offer.price}</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {editMode ? (
          <button
            onClick={saveEdit}
            className="btn btn-success btn-sm"
            disabled={isLoading}
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="btn btn-info btn-sm"
            disabled={isLoading}
          >
            Edit
          </button>
        )}
        <button
          onClick={() => onDelete(offer.id)}
          className="btn btn-error btn-sm"
          disabled={isLoading}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Offers;
