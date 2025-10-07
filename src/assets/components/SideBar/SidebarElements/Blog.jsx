/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/AuthProvider";

const API = "https://bright-ants-backend.onrender.com";

const Blog = () => {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    author: "",
    content: "",
    image: null,
    existingImage: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API}/blogs`);
      const data = await res.json();
      setBlogs(data.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load blogs", "error");
    }
  };

  useEffect(() => {
    fetchBlogs();
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
      title: "",
      author: "",
      content: "",
      image: null,
      existingImage: null,
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.author || !form.content) {
      return Swal.fire("Warning", "Please fill in all fields", "warning");
    }

    try {
      setIsLoading(true);
      let imageName = form.existingImage;

      // Upload new image if selected
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
        title: form.title,
        author: form.author,
        content: form.content,
        image: imageName,
      };

      const method = isEditing ? "PATCH" : "POST";
      const endpoint = isEditing ? `${API}/blogs/${form.id}` : `${API}/blogs`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save blog");

      Swal.fire(
        "Success",
        isEditing ? "Blog updated" : "Blog added",
        "success"
      );
      resetForm();
      fetchBlogs();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setForm({
      id: blog.id,
      title: blog.title,
      author: blog.author,
      content: blog.content,
      image: null,
      existingImage: blog.image || null,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This blog will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API}/blogs/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Blog has been deleted.", "success");
          fetchBlogs();
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Blogs Management</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded p-6 mb-10 space-y-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          className="input input-bordered w-full"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          className="input input-bordered w-full"
          value={form.author}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Blog Content"
          className="textarea textarea-bordered w-full"
          value={form.content}
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
              onError={(e) => (e.target.src = "/placeholder-image.jpg")}
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isEditing ? "Update Blog" : "Add Blog"}
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

      {/* Blog List */}
      <div className="grid gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white shadow rounded p-4 flex gap-4 items-start"
          >
            <img
              src={`${API}/files/${blog.image}`}
              alt={blog.title}
              className="w-24 h-24 object-cover rounded"
              onError={(e) => (e.target.src = "/placeholder-image.jpg")}
            />
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-black">{blog.title}</h2>
              <p className="text-gray-600 text-sm">By {blog.author}</p>
              <p className="text-gray-500 text-xs">
                Published:{" "}
                {blog.created_at
                  ? new Date(blog.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
              {blog.updated_at && blog.updated_at !== blog.created_at && (
                <p className="text-gray-400 text-xs">
                  Updated: {new Date(blog.updated_at).toLocaleDateString()}
                </p>
              )}
              <p className="mt-2 text-gray-700">{blog.content}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleEdit(blog)}
                className="btn btn-sm btn-info"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(blog.id)}
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

export default Blog;
