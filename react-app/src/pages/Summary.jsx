import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import SearchFilter from "../components/SearchFilter";
import SearchResults from "../components/SearchResults";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Summary() {
  const location = useLocation();
  const topicFromState = location.state?.topic;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTopicData = async (topic) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://lossless-learning-firestore-fastapi-203101603788.us-central1.run.app/resources?topic=${encodeURIComponent(topic)}`
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicFromState) {
      fetchTopicData(topicFromState);
    }
  }, [topicFromState]);

  return (
    <div className="flex"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='none' stroke='%23e5e7eb' stroke-width='1' d='M0 0h48v48H0z M24 0v48 M0 24h48'/%3E%3C/svg%3E\")",
      backgroundSize: "48px 48px",
    }}
    >
      <Navbar />
      <main className="ml-64 p-8 w-full">
        <div className="flex gap-6 w-full max-w-full overflow-hidden">
          <div className="flex-1 min-w-0">
            <SearchBar onTopicClick={fetchTopicData} />

            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <SearchResults data={results} />
            )}
          </div>

          <SearchFilter />
        </div>
      </main>
    </div>
  );
}
