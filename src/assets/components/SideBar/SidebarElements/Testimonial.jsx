/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/AuthProvider";

const API = "https://bright-ants-backend.onrender.com";

const Testimonial = () => {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    designation: "",
    company: "",
    image: null,
    content: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch testimonials on mount
  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${API}/testimonials`);
      const data = await res.json();
      setTestimonials(data.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load testimonials", "error");
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      designation: "",
      company: "",
      image: null,
      content: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.designation || !form.company || !form.content) {
      return Swal.fire(
        "Warning",
        "Please fill in all required fields",
        "warning"
      );
    }

    if (!isEditing && testimonials.length >= 3) {
      return Swal.fire(
        "Limit Reached",
        "You can only add up to 3 testimonials.",
        "warning"
      );
    }

    try {
      setIsLoading(true);

      let imageName = form.image;

      if (form.image instanceof File) {
        const formData = new FormData();
        formData.append("file", form.image);

        const uploadRes = await fetch(`${API}/files`, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        imageName = uploadData.files[0].name;
      }

      const payload = {
        name: form.name,
        designation: form.designation,
        company: form.company,
        image: imageName,
        content: form.content,
      };

      const method = isEditing ? "PATCH" : "POST";
      const endpoint = isEditing
        ? `${API}/testimonials/${form.id}`
        : `${API}/testimonials`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save testimonial");

      Swal.fire(
        "Success",
        isEditing ? "Updated successfully" : "Added successfully",
        "success"
      );
      resetForm();
      fetchTestimonials();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (t) => {
    setForm({
      id: t.id,
      name: t.name,
      designation: t.designation,
      company: t.company,
      image: t.image,
      content: t.content,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This testimonial will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API}/testimonials/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Testimonial has been deleted.", "success");
          fetchTestimonials();
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Testimonial Management
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white  shadow-md rounded p-6 mb-10 space-y-4 "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
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
            type="text"
            name="company"
            placeholder="Company"
            className="input input-bordered w-full"
            value={form.company}
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
        </div>
        <textarea
          name="content"
          placeholder="Testimonial content"
          className="textarea textarea-bordered w-full"
          value={form.content}
          onChange={handleChange}
          required
        />
        <div className="flex gap-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isEditing ? "Update" : "Add"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="grid gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white shadow rounded p-4 flex gap-4 items-start dark:text-black"
          >
            <img
              src={`${API}/files/${t.image}`}
              alt={t.name}
              className="w-20 h-20 object-cover rounded"
              onError={(e) => (e.target.src = "/placeholder-image.jpg")}
            />
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="text-sm text-gray-500">
                {t.designation} at {t.company}
              </p>
              <p className="mt-2">{t.content}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleEdit(t)}
                className="btn btn-sm btn-info"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="btn btn-sm btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
