/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../auth/AuthProvider';

const API = "https://bright-ants-backend.onrender.com";

const Attorney = () => {
  const { token } = useAuth();
  const [attorneys, setAttorneys] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    designation: '',
    image: null, // File object
    existingImage: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch attorneys
  const fetchAttorneys = async () => {
    try {
      const res = await fetch(`${API}/attorneys`);
      const data = await res.json();
      setAttorneys(data.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load attorneys", "error");
    }
  };

  useEffect(() => {
    fetchAttorneys();
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
      name: '',
      designation: '',
      image: null,
      existingImage: null,
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.designation) {
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
        name: form.name,
        designation: form.designation,
        image: imageName,
      };

      const method = isEditing ? 'PATCH' : 'POST';
      const endpoint = isEditing
        ? `${API}/attorneys/${form.id}`
        : `${API}/attorneys`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save attorney");

      Swal.fire("Success", isEditing ? "Attorney updated" : "Attorney added", "success");
      resetForm();
      fetchAttorneys();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (attorney) => {
    setForm({
      id: attorney.id,
      name: attorney.name,
      designation: attorney.designation,
      image: null,
      existingImage: attorney.image || null,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This attorney will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API}/attorneys/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire("Deleted!", "Attorney has been deleted.", "success");
          fetchAttorneys();
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Attorneys Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 mb-10 space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Attorney Name"
          className="input input-bordered w-full"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          className="input input-bordered w-full"
          value={form.designation}
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
            {isEditing ? "Update Attorney" : "Add Attorney"}
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
        {attorneys.map((attorney) => (
          <div key={attorney.id} className="bg-white shadow rounded p-4 flex gap-4 items-start">
            <img
              src={`${API}/files/${attorney.image}`}
              alt={attorney.name}
              className="w-24 h-24 object-cover rounded"
              onError={(e) => (e.target.src = "/placeholder-image.jpg")}
            />
            <div className="flex-grow">
              <h2 className="text-xl font-semibold">{attorney.name}</h2>
              <p className="text-gray-600">{attorney.designation}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleEdit(attorney)} className="btn btn-sm btn-info">Edit</button>
              <button onClick={() => handleDelete(attorney.id)} className="btn btn-sm btn-error">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attorney;
