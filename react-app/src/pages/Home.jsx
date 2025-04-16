import { useState } from "react";
import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import TopLikedResources from "../components/TopLikedResources";

export default function Home() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  return (
    <div
      className="flex"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='none' stroke='%23e5e7eb' stroke-width='1' d='M0 0h48v48 M24 0v48 M0 24h48'/%3E%3C/svg%3E\")",
        backgroundSize: "48px 48px",
      }}
    >
      <Navbar />
      <main className="ml-64 p-8 w-full">
        <div className="flex gap-6 w-full max-w-full overflow-hidden">
          <div className="flex-1 min-w-0">
            <SearchBar
              onTopicClick={(topic) =>
                navigate(`/summary/${encodeURIComponent(topic)}`)
              }
              onSearchResults={({ query }) =>
                navigate(`/query/${encodeURIComponent(query)}`)
              }
            />

            {showContent ? (
              <div className="bg-white border border-gray-300 rounded-lg px-8 py-6 mb-6 shadow-sm w-full">
              <h1 className="text-2xl mb-2">Welcome to Lossless Learning</h1>
              <p className="text-lg font-serif mb-4 text-gray-600">
                Your destination for mastering machine learning, coding, mathematics, and more — with clarity and speed.
              </p>
            
              
              <hr className="border-gray-200 mb-4" />
            
             
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-3">
                <li>
                  <span className="text-emerald-500 font-semibold">Curated Resources:</span> Handpicked GitHub repos, YouTube videos, articles, and book content — all in one place.
                </li>
                <li>
                  <span className="text-emerald-500 font-semibold">Smart Summaries:</span> Understand faster with concise explanations and topic overviews.
                </li>
                <li>
                  <span className="text-emerald-500 font-semibold">Community Favorites:</span> See what others love and find what’s most helpful, quickly.
                </li>
                <li>
                  <span className="text-emerald-500 font-semibold">Search & Filter:</span> Discover exactly what you need by topic, domain, or resource type.
                </li>
              </ul>
            </div>
            
            
            ) : (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
              </div>
            )}

            
            <div className={showContent ? "" : "hidden"}>
              <TopLikedResources onLoadComplete={() => setShowContent(true)} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
