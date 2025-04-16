import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import SearchFilter from "../components/SearchFilter";
import FavoritesResults from "../components/FavoritesResults";
import { useNavigate } from "react-router-dom";

// API endpoints
const API_BASE = "https://lossless-learning-cloudsql-fastapi-kbhge3in6a-uc.a.run.app";
const FIRESTORE_BASE = "https://lossless-learning-firestore-fastapi-203101603788.us-central1.run.app";


// Favorites page
export default function Favorites() {
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  // Store state variables for favorites, fetching data, and resource types 
  const [favoritesData, setFavoritesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const typeLabelMap = {
    "YouTube Video": "videos",
    "GitHub Repository": "github_repos",
    "Article": "articles",
    "Book": "book_content",
  };

  // Filter by resource logic
  const handleTypeToggle = (typeLabel) => {
    setSelectedTypes((prev) =>
      prev.includes(typeLabel)
        ? prev.filter((t) => t !== typeLabel)
        : [...prev, typeLabel]
    );
  };

  const filteredFavorites =
    selectedTypes.length === 0
      ? favoritesData
      : favoritesData.filter((item) =>
          selectedTypes.includes(
            Object.entries(typeLabelMap).find(([_, v]) => v === item.resource_type?.toLowerCase())?.[0]
          )
        );

  // Get favorite resources from backend 
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/likes`);
      const ids = await res.json();

      if (ids.length === 0) {
        setFavoritesData([]);
        return;
      }

      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${FIRESTORE_BASE}/resource/${id}`);
          const data = await res.json();
          return {
            ...data,
            resource_id: id,
          };
        })
      );

      setFavoritesData(results);
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      setFavoritesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

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

      <main className="md:ml-64 p-4 md:p-8 w-full max-w-full overflow-x-hidden min-h-screen">
        <div className="flex gap-6 w-full max-w-full items-start">
          {/* Results Section */}
          <div className="flex-1 min-w-0">
            <SearchBar
              onTopicClick={(topic) => navigate(`/summary/${encodeURIComponent(topic)}`)}
              onSearchResults={({ query }) => navigate(`/query/${encodeURIComponent(query)}`)}
            />

            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <FavoritesResults data={filteredFavorites} />
            )}
          </div>

          {/* Filter Section */}
          <div className="w-[14rem]">
            <SearchFilter
              selectedTypes={selectedTypes}
              onToggleType={handleTypeToggle}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
