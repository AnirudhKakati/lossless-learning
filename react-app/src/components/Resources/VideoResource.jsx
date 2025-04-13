import { FaYoutube } from "react-icons/fa";
import { useState } from 'react';

export default function VideoResource({ resource }) {
  const [activeTab, setActiveTab] = useState("summary");

  if (!resource) {
    return <div className="text-gray-500">No resource found.</div>;
  }

  const {
    resource_type,
    video_title,
    url,
    video_topic,
    video_domain,
    transcript,
  } = resource;

  const embedUrl = url?.includes("watch?v=")
    ? url.replace("watch?v=", "embed/")
    : url;

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-6 items-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-300 shrink-0">
            <FaYoutube className="w-10 h-10 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {resource_type}
            </h2>
            <p className="text-emerald-300 font-semibold">{video_title}</p>
            <p className="text-gray-500 text-sm">
              {video_topic} | {video_domain}
            </p>
          </div>
        </div>
      </div>

      <iframe
        className="w-full rounded-md mb-8"
        style={{ height: "500px" }}
        src={embedUrl}
        title={video_title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>

      <div className="border-b border-gray-300 mb-2 flex gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-1 ${
            activeTab === "summary"
              ? "text-emerald-300 border-b-2 border-emerald-300"
              : "text-gray-500"
          }`}
        >
          Generated Summary
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-1 ${
            activeTab === "details"
              ? "text-emerald-300 border-b-2 border-emerald-300"
              : "text-gray-500"
          }`}
        >
          Resource Details
        </button>
      </div>

      <div className="text-sm text-gray-700 space-y-3">
        {activeTab === "summary" && (
          <p>{transcript || "No transcript available."}</p>
        )}
        {activeTab === "details" && (
          <p>{`More details coming soon...`}</p>
        )}
      </div>
    </div>
  );
}
