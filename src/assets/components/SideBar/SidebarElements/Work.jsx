/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/AuthProvider";

const API = "https://bright-ants-backend.onrender.com";

const Work = () => {
  const { token } = useAuth();
  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch works
  const fetchWorks = async () => {
    try {
      const res = await fetch(`${API}/works`);
      const data = await res.json();
      setWorks(data.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load works", "error");
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  // Add new work
  const handleAdd = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);

      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API}/files`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");
      const uploadData = await uploadRes.json();
      const imageName = uploadData.files[0].name;

      // Create work
      const payload = { title: "work", image: imageName };
      const res = await fetch(`${API}/works`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save work");

      Swal.fire("Success", "Work added", "success");
      fetchWorks();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsLoading(false);
      e.target.value = ""; // reset input
    }
  };

  // Update work image (without changing order)
  const handleEdit = async (work, file) => {
    if (!file) return;

    try {
      setIsLoading(true);

      // Upload new file
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API}/files`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");
      const uploadData = await uploadRes.json();
      const imageName = uploadData.files[0].name;

      // Update work
      const payload = { title: work.title, image: imageName };
      const res = await fetch(`${API}/works/${work.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update work");

      Swal.fire("Success", "Work updated", "success");

      // ✅ Update image locally to maintain order
      setWorks((prevWorks) =>
        prevWorks.map((w) =>
          w.id === work.id ? { ...w, image: imageName } : w
        )
      );
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete work
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This work will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API}/works/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Work has been deleted.", "success");
          fetchWorks();
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Work Management</h1>

      {/* Upload Button */}
      <div className="mb-6">
        <label className="btn btn-primary cursor-pointer">
          {isLoading ? "Uploading..." : "Add Work"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAdd}
            disabled={isLoading}
          />
        </label>
      </div>

      {/* List of works */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {works.map((work) => (
          <div
            key={work.id}
            className="bg-white shadow rounded p-3 flex flex-col items-center"
          >
            <img
              src={`${API}/files/${work.image}`}
              alt={work.title}
              className="w-32 h-32 object-cover rounded mb-2"
              onError={(e) => (e.target.src = "/placeholder-image.jpg")}
            />

            <div className="flex gap-2">
              <label className="btn btn-xs btn-info cursor-pointer">
                Edit
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleEdit(work, e.target.files[0])}
                  disabled={isLoading}
                />
              </label>
              <button
                onClick={() => handleDelete(work.id)}
                className="btn btn-xs btn-error"
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

export default Work;
