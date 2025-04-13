import { useState, useEffect } from "react"
import { FiBookOpen, FiGithub } from "react-icons/fi"
import { FaYoutube } from "react-icons/fa"

export default function SearchResults({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1); 
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
    switch (type.toLowerCase()) {
      case "videos":
        return <FaYoutube className="w-5 h-5 text-emerald-300" />;
      case "github_repos":
        return <FiGithub className="w-5 h-5 text-emerald-300" />;
      case "articles":
      default:
        return <FiBookOpen className="w-5 h-5 text-emerald-300" />;
    }
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
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 shrink-0 transition-colors duration-200 group-hover:border-emerald-300">
                {getIcon(resource.resource_type || resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-sm mb-1 font-medium truncate">{resource.resource_type || resource.type}</p>
                <p className="text-emerald-300 mb-1 text-sm text-base truncate">{resource.title}</p>
                <p className="text-gray-600 text-xs truncate">{resource.description}</p>
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
