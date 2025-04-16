import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import SearchFilter from "../components/SearchFilter";
import SearchResults from "../components/SearchResults";

// Page for search by explore 
export default function Summary() {
  const { topic } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const typeLabelMap = {
    "YouTube Video": "videos",
    "GitHub Repository": "github_repos",
    "Article": "articles",
    "Book": "book_content",
  };

  // Use topics to return relevant resources
  useEffect(() => {
    const fetchData = async () => {
      if (!topic) return;
      try {
        setLoading(true);
        const res = await fetch(
          `https://lossless-learning-firestore-fastapi-203101603788.us-central1.run.app/resources?topic=${encodeURIComponent(
            topic
          )}`
        );
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topic]);

  // Logic for resource filter
  const handleTypeToggle = (typeLabel) => {
    setSelectedTypes((prev) =>
      prev.includes(typeLabel)
        ? prev.filter((t) => t !== typeLabel)
        : [...prev, typeLabel]
    );
  };

  const filteredResults =
    selectedTypes.length === 0
      ? results
      : results.filter((item) =>
          selectedTypes.includes(
            Object.entries(typeLabelMap).find(([_, v]) => v === item.resource_type?.toLowerCase())?.[0]
          )
        );

  return (
    <div
      className="flex w-full overflow-x-hidden"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='none' stroke='%23e5e7eb' stroke-width='1' d='M0 0h48v48 M24 0v48 M0 24h48'/%3E%3C/svg%3E\")",
        backgroundSize: "48px 48px",
      }}
    >

      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Main content */}
      <main className="md:ml-64 p-4 md:p-8 w-full max-w-full overflow-x-hidden min-h-screen">
        <div className="flex gap-6 w-full max-w-full items-start">
          <div className="flex-1 min-w-0">
            <SearchBar
              onTopicClick={(topic) => navigate(`/summary/${encodeURIComponent(topic)}`)}
              onSearchResults={({ query }) => navigate(`/query/${encodeURIComponent(query)}`)}
            />

            {/* Load explore search results using SearchResults component */}
            {!topic ? (
              <div className="text-center text-sm text-gray-500">
                No results. Please search for a topic or adjust resource filters.
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <SearchResults data={filteredResults} />
            )}
          </div>

          <SearchFilter
            selectedTypes={selectedTypes}
            onToggleType={handleTypeToggle}
          />
        </div>
      </main>
    </div>
  );
}
