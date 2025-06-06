import { useState, useEffect } from "react";
import { FiBookOpen, FiGithub, FiFileText } from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LikeButton from "./LikeButton";
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Endpoint for fetching results
const API_BASE = "https://lossless-learning-cloudsql-fastapi-kbhge3in6a-uc.a.run.app";

export default function SearchResults({ data }) {

  // Store states for current page, likes, loading data
  const [currentPage, setCurrentPage] = useState(1);
  const [likedResources, setLikedResources] = useState([]);
  const [likeCounts, setLikeCounts] = useState({});
  const [likeDataLoaded, setLikeDataLoaded] = useState(false);
  const pageSize = 10;
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const summary = data.find((r) => r.resource_type === "topic_summaries");
  const otherResources = data.filter((r) => r.resource_type !== "topic_summaries");

  // Sort likes
  const sortedResources = [...otherResources].sort((a, b) => {
    const likesA = likeCounts[a.resource_id] || 0;
    const likesB = likeCounts[b.resource_id] || 0;
    return likesB - likesA;
  });

  // Current Page Calculations
  const totalPages = Math.ceil(sortedResources.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageResources = sortedResources.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    setLikeDataLoaded(false);

    const fetchLikeData = async () => {
      if (!userId || otherResources.length === 0) return;

      try {
        const [likedRes, countsArr] = await Promise.all([
          fetch(`${API_BASE}/users/${userId}/likes`).then((res) => res.json()),
          Promise.all(
            otherResources.map((resource) =>
              fetch(`${API_BASE}/resources/${resource.resource_id}/likes`)
                .then((res) => res.json())
                .then((json) => ({ [resource.resource_id]: json.like_count || 0 }))
            )
          ),
        ]);

        setLikedResources(likedRes || []);
        setLikeCounts(Object.assign({}, ...countsArr));
        setLikeDataLoaded(true);
      } catch (err) {
        console.error("Error fetching like data:", err);
      }
    };

    fetchLikeData();
  }, [currentPage, userId, data]);

  // Next Page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setLikeDataLoaded(false);
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Previous Page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setLikeDataLoaded(false);
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Get icons for resources
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "videos":
        return <FaYoutube className="h-7 w-7 text-gray-600 group-hover:text-emerald-300 transition-colors" />;
      case "github_repos":
        return <FiGithub className="h-7 w-7 text-gray-600 group-hover:text-emerald-300 transition-colors" />;
      case "book_content":
        return <FiBookOpen className="h-7 w-7 text-gray-600 group-hover:text-emerald-300 transition-colors" />;
      default:
        return <FiFileText className="h-7 w-7 text-gray-600 group-hover:text-emerald-300 transition-colors" />;
    }
  };

  // Get title, different title names for resource so need to standardize
  const extractTitle = (resource) => {
    const title = resource.repo_name || resource.video_title || resource.title || resource.book_title || "Untitled";
    return title.length > 60 ? title.slice(0, 57) + "..." : title;
  };

  // Format topic and domain
  const formatDescription = (resource) => {
    return `${resource.topic || "Unknown Topic"} | ${resource.domain || "Unknown Domain"}`;
  };

  // Set types for display
  const formatType = (type) => {
    switch (type?.toLowerCase()) {
      case "videos":
        return "YouTube Video";
      case "github_repos":
        return "GitHub Repository";
      case "book_content":
        return "Book Content";
      default:
        return "Article";
    }
  };

  const handleCardClick = (resourceId) => {
    navigate(`/resource/${resourceId}`);
  };

  // Function for parsing and rendering LaTeX and Markdown
  function renderSummaryWithMath(summaryText) {
    if (!summaryText) return null;

    const parts = summaryText.split(/(\\\[.*?\\\]|\\\(.*?\\\))/gs);

    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith("\\[") && part.endsWith("\\]")) {
            return (
              <div key={index} className="my-4">
                <TeX block>{part.slice(2, -2)}</TeX>
              </div>
            );
          }

          if (part.startsWith("\\(") && part.endsWith("\\)")) {
            return (
              <span key={index} className="inline">
                {" "}
                <TeX>{part.slice(2, -2)}</TeX>{" "}
              </span>
            );
          }

          return (
            <span key={index} className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <>{children}</>,
                }}
              >
                {part}
              </ReactMarkdown>
            </span>
          );
        })}
      </>
    );
  }

  // Animate loading if data isnt all ready
  if (!likeDataLoaded) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mt-10" />
      </div>
    );
  }

  return (
    <div className="space-y-3 min-h-screen p-4">
      {/* Render summary with latex and markdown */}
      {currentPage === 1 && summary && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="text-xl font-semibold text-emerald-700 mb-2">
            {summary.topic} — Summary
          </h2>
          <div className="prose text-sm">{renderSummaryWithMath(summary.summary)}</div>
        </div>
      )}

      {data.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          No results found. Please try searching with different terms or adjust resource filters.
        </p>
      ) : (
        <> {/* Render each card with like button */}
          {pageResources.map((resource, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(resource.resource_id)}
              className="cursor-pointer group p-3 flex items-center gap-3 border rounded-md shadow-sm bg-white relative hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <p className="absolute top-3 right-3 text-gray-500 text-xs hidden sm:block">{resource.date}</p>

              <div className="hidden xl:block">
                <LikeButton
                  resourceId={resource.resource_id}
                  initialLiked={likedResources.includes(resource.resource_id)}
                  initialCount={likeCounts[resource.resource_id] || 0}
                />
              </div>

              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-300 shrink-0 group-hover:border-emerald-300 transition-colors">
                {getIcon(resource.resource_type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-emerald-500 mb-1 text-md font-bold truncate">{extractTitle(resource)}</p>
                <p className="text-gray-700 mb-1 text-sm font-bold truncate">{formatDescription(resource)}</p>
                <p className="text-gray-600 text-sm truncate">{formatType(resource.resource_type)}</p>
              </div>
            </div>
          ))}

          {data.length > pageSize && (
            <div className="pt-4 flex items-center justify-center gap-x-6">
              {currentPage > 1 && (
                <button
                  onClick={goToPreviousPage}
                  className="w-24 px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 transition"
                >
                  Previous
                </button>
              )}

              <p className="text-sm text-gray-600">Page {currentPage}</p>

              {currentPage < totalPages && (
                <button
                  onClick={goToNextPage}
                  className="w-24 px-4 py-2 bg-emerald-500 text-white rounded-md shadow-sm hover:bg-emerald-500 transition"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
