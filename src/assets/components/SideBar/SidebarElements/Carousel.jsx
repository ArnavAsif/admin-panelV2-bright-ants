/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';

import Swal from 'sweetalert2';
import { useAuth } from '../../auth/AuthProvider';

const API = "https://bright-ants-backend.onrender.com";

const Carousel = () => {
    
    const { token } = useAuth();
    const [filesRow1, setFilesRow1] = useState([]);
    const [filesRow2, setFilesRow2] = useState([]);
    const [fileRow, setFileRow] = useState({ 1: null, 2: null });
    const [isUploadingRow, setIsUploadingRow] = useState({ 1: false, 2: false });

    const fetchFiles = async (row) => {
        try {
            const res = await fetch(`${API}/carousel-images/row/${row}`);
            const data = await res.json();
            if (row === 1) setFilesRow1(data.data || []);
            else setFilesRow2(data.data || []);
        } catch (err) {
            Swal.fire("Error", `Failed to fetch row ${row} files`, "error");
        }
    };

    useEffect(() => {
        fetchFiles(1);
        fetchFiles(2);
    }, []);

    const handleUpload = async (row) => {
        const file = fileRow[row];
        if (!file) {
            Swal.fire("Warning", "Please select a file", "warning");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
            Swal.fire("Error", "Only image files are allowed", "error");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire("Error", "File must be smaller than 5MB", "error");
            return;
        }

        setIsUploadingRow((prev) => ({ ...prev, [row]: true }));

        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch(`${API}/files`, {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!uploadRes.ok) throw new Error("File upload failed");

            const uploadData = await uploadRes.json();
            const uploadedFile = uploadData.files[0];

            await fetch(`${API}/carousel-images`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ filename: uploadedFile.name, row }),
            });

            Swal.fire("Uploaded!", "File uploaded successfully.", "success");
            setFileRow((prev) => ({ ...prev, [row]: null }));
            fetchFiles(row);
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setIsUploadingRow((prev) => ({ ...prev, [row]: false }));
        }
    };

    const handleDelete = async (id, row) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This file will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await fetch(`${API}/carousel-images/${id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    Swal.fire("Deleted!", "Your file has been deleted.", "success");
                    fetchFiles(row);
                } catch (err) {
                    Swal.fire("Error", err.message, "error");
                }
            }
        });
    };

    const renderRow = (row, files) => (
        <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Row {row}</h2>

            {/* Upload */}
            <div className="flex gap-2 mb-6">
                <input
                    className='file-input file-input-info'
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={(e) => setFileRow((prev) => ({ ...prev, [row]: e.target.files[0] }))}
                    disabled={isUploadingRow[row]}
                />
                <button
                    onClick={() => handleUpload(row)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                    disabled={!fileRow[row] || isUploadingRow[row]}
                >
                    {isUploadingRow[row] ? "Uploading..." : "Upload"}
                </button>
            </div>

            {/* Files */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((f) => (
                    <div key={f.id} className="border p-2 rounded">
                        <img
                            src={`${API}/files/${f.filename}`}
                            alt={f.filename}
                            className="w-full h-32 object-contain mb-2"
                            onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-sm truncate">{f.filename}</span>
                            <button
                                onClick={() => handleDelete(f.id, row)}
                                className="text-red-500 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Media Management</h1>
            {renderRow(1, filesRow1)}
            {renderRow(2, filesRow2)}
        </div>
    );
};

export default Carousel;
