import { useState, useEffect } from "react";
import { FiBookOpen, FiGithub } from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";

export default function SearchResults({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1); // Reset page on new data
  }, [data]);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageResources = data.slice(startIndex, startIndex + pageSize);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "videos":
        return <FaYoutube className="h-7 w-7 text-gray-600 transition-colors duration-200 group-hover:text-emerald-300" />;
      case "github_repos":
        return <FiGithub className="h-7 w-7 text-gray-600 transition-colors duration-200 group-hover:text-emerald-300" />;
      case "articles":
      default:
        return <FiBookOpen className="h-7 w-7 text-gray-600 transition-colors duration-200 group-hover:text-emerald-300" />;
    }
  };

  const formatType = (type) => {
    switch (type?.toLowerCase()) {
      case "videos":
        return "YouTube Video";
      case "github_repos":
        return "GitHub Repository";
      case "articles":
      default:
        return "Article";
    }
  };

  const extractTitle = (resource) => {
    if (resource.repo_name) return resource.repo_name;
    if (resource.video_title) return resource.video_title;
    return resource.title || "Untitled";
  };

  const formatDescription = (resource) => {
    return `${resource.topic || "Unknown Topic"} | ${resource.domain || "Unknown Domain"}`;
  };

  return (
    <div className="space-y-3 bg-gray-100 min-h-screen p-4">
      {data.length === 0 ? (
        <p className="text-center text-sm text-gray-500">No results found. Please try searching with different terms.</p>
      ) : (
        <>
          {pageResources.map((resource, index) => (
            <div
              key={index}
              className="group p-3 flex items-center gap-3 border rounded-md shadow-sm bg-white relative transition-colors duration-200 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <p className="absolute top-3 right-3 text-gray-500 text-xs hidden sm:block">{resource.date}</p>
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-300 shrink-0 transition-colors duration-200 group-hover:border-emerald-300">
                {getIcon(resource.resource_type)}
              </div>
                <div className="flex-1 min-w-0">
                    <p className="text-emerald-300 mb-1 text-md font-bold truncate">{extractTitle(resource)}</p>
                    <p className="text-gray-700 mb-1 text-sm font-bold text-base truncate">{formatDescription(resource)}</p>
                    <p className="text-gray-600 text-xs mb-1 truncate">{formatType(resource.resource_type)}</p>
                </div>
            </div>
          ))}

          {data.length > pageSize && (
            <div className="pt-4 flex items-center justify-center gap-x-6">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="w-24 px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 transition-colors duration-200 disabled:opacity-0"
              >
                Previous
              </button>

              <p className="text-sm text-gray-600">Page {currentPage}</p>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="w-24 px-4 py-2 bg-emerald-300 text-white rounded-md shadow-sm hover:bg-emerald-400 transition-colors duration-200 disabled:opacity-0"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
