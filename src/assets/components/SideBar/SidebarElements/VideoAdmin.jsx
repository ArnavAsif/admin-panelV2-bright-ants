import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/AuthProvider";

const API = "https://bright-ants-backend.onrender.com";

const VideoAdmin = () => {
  const { token } = useAuth();
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false); // 🔄 NEW: Loading state

  useEffect(() => {
    fetch(`${API}/files/video.mp4`, {
      method: "HEAD",
    }).then((res) => {
      if (res.ok) {
        setVideoUrl(`${API}/files/video.mp4`);
      }
    });
  }, []);

  const handleChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      return Swal.fire("Warning", "Please select a video file", "warning");
    }

    try {
      setLoading(true); // 🔄 Start loading
      const formData = new FormData();
      formData.append("file", videoFile);

      const res = await fetch(`${API}/files`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Video upload failed");

      const data = await res.json();
      const uploadedFile = data.files?.[0]?.name;

      if (uploadedFile) {
        setVideoUrl(`${API}/files/${uploadedFile}`);
        setVideoFile(null);
        Swal.fire("Success", "Video uploaded successfully", "success");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false); // 🔄 End loading
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will remove the video from the admin panel (not from server).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        setVideoUrl(null);
        Swal.fire("Deleted!", "Video removed from view.", "success");
      }
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Video Management</h1>

      {/* Upload form if no video */}
      {!videoUrl && (
        <form
          onSubmit={handleUpload}
          className="bg-white shadow-md rounded p-6 mb-6 space-y-4"
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleChange}
            disabled={loading}
            className="file-input file-input-bordered w-full"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Upload Video"
            )}
          </button>
        </form>
      )}

      {/* Video preview */}
      {videoUrl && (
        <div className="bg-white shadow-md rounded p-6 space-y-4">
          <video
            controls
            autoPlay
            muted
            playsInline
            loop
            src={videoUrl}
            className="w-full rounded"
          />
          <div className="flex justify-end">
            <button onClick={handleDelete} className="btn btn-error">
              Remove Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAdmin;
