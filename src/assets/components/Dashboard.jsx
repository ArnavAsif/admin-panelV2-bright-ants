import React from "react";
import {
  FaUsers,
  FaCloudUploadAlt,
  FaClipboardList,
  FaEye,
} from "react-icons/fa";

const Dashboard = () => {
  // Mock KPI stats
  const stats = [
    {
      label: "Total Works",
      value: 128,
      icon: <FaClipboardList size={28} />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Users",
      value: 34,
      icon: <FaUsers size={28} />,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Storage Used",
      value: "512 MB",
      icon: <FaCloudUploadAlt size={28} />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Pending Reviews",
      value: 3,
      icon: <FaEye size={28} />,
      color: "bg-red-100 text-red-600",
    },
  ];

  const recentUploads = [
    {
      title: "Work 1",
      image: "https://media.istockphoto.com/id/1481370371/photo/portrait-of-enthusiastic-hispanic-young-woman-working-on-computer-in-a-modern-bright-office.jpg?s=612x612&w=0&k=20&c=8kNce9Ruc9F2KXvnwf0stWQXCwwQTBCrW8efrqhUIa4=",
      date: "2025-08-15",
    },
    {
      title: "Work 2",
      image: "https://burst.shopifycdn.com/photos/macbook-air-on-desk.jpg?width=1000&format=pjpg&exif=0&iptc=0",
      date: "2025-08-14",
    },
    {
      title: "Work 3",
      image: "https://plus.unsplash.com/premium_photo-1661284828052-ea25d6ea94cd?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29ya3xlbnwwfHwwfHx8MA%3D%3D",
      date: "2025-08-13",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-5 rounded-lg shadow-md hover:shadow-lg transition duration-300 border ${stat.color} bg-opacity-50`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-white bg-opacity-70">
                {stat.icon}
              </div>
              <div>
                <div className="text-xl font-semibold">{stat.value}</div>
                <div className="text-sm">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Uploads */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Uploads</h2>
        <ul className="divide-y divide-gray-100">
          {recentUploads.map((upload, index) => (
            <li
              key={index}
              className="flex items-center py-4 hover:bg-gray-50 px-2 rounded transition"
            >
              <img
                src={upload.image}
                alt={upload.title}
                className="w-16 h-16 object-cover rounded-md mr-4 border"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-700">{upload.title}</div>
                <div className="text-sm text-gray-400">
                  Uploaded on {upload.date}
                </div>
              </div>
              <button className="text-blue-600 hover:underline text-sm">View</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
