import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaYoutube } from "react-icons/fa";

export default function VideoResource({ resource }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const { id: urlResourceId } = useParams();

  if (!resource) {
    return <div className="text-gray-500">No resource found.</div>;
  }

  const {
    resource_id = urlResourceId,
    resource_type,
    video_title,
    url,
    topic,
    domain,
    transcript,
    summary,
  } = resource;

  const embedUrl = url?.includes("watch?v=")
    ? url.replace("watch?v=", "embed/")
    : url;

  const handlePlayAudio = async () => {
    try {
      setLoadingAudio(true);
      const res = await fetch(
        `https://lossless-learning-audios-fastapi-kbhge3in6a-uc.a.run.app/get_audio?resource_id=${resource_id}`
      );
      if (!res.ok) throw new Error("Failed to fetch audio");

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setAudioUrl(objectUrl);
    } catch (err) {
      console.error("Audio fetch error:", err);
      alert("Unable to load audio summary.");
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-6 items-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-300 shrink-0">
            <FaYoutube className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-emerald-500">
              {video_title}
            </h2>
            <p className="text-gray-800 font-semibold">
              {topic} | {domain}
            </p>
            <p className="text-gray-500 text-sm">YouTube Video</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <iframe
          className="w-full rounded-md mb-8"
          style={{ height: "500px" }}
          src={embedUrl}
          title={video_title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div className="flex border-b border-gray-300 gap-4 text-sm font-semibold mb-4">
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-1 ${
            activeTab === "summary"
              ? "text-emerald-500 border-b-2 border-emerald-500"
              : "text-gray-500"
          }`}
        >
          Generated Summary
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-1 ${
            activeTab === "details"
              ? "text-emerald-500 border-b-2 border-emerald-500"
              : "text-gray-500"
          }`}
        >
          Video Transcript
        </button>
      </div>

      <div className="text-sm text-gray-700 space-y-3">
        {activeTab === "summary" && (
          <div className="max-h-[300px] overflow-y-auto pr-2">
            <div className="sticky top-0 z-10 pb-2 bg-white">
            {!audioUrl && (
              <button
                onClick={handlePlayAudio}
                className="mt-4 text-sm text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-md shadow"
              >
                {loadingAudio ? "Loading..." : "Play Summary Audio"}
              </button>
            )}

            {audioUrl && (
              <div className="mt-4">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            </div>
            <p className="whitespace-pre-line mt-4">
              {summary || "No summary available."}
            </p>

          </div>
        )}

        {activeTab === "details" && (
          <div className="max-h-[300px] overflow-y-auto pr-2">
            <p className="whitespace-pre-line mt-4">
              {transcript || "No transcript available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
