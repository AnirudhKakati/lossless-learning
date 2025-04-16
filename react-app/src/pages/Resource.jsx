import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";
import ResourcePage from "../components/Resources/ResourcePage";

export default function Resource() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

    const handleTopicClick = (topic) => {
        navigate(`/summary/${encodeURIComponent(topic)}`);
      };


  useEffect(() => {
    async function fetchResource() {
      try {
        setLoading(true);
        const res = await fetch(`https://lossless-learning-firestore-fastapi-203101603788.us-central1.run.app/resource/${id}`);
        const data = await res.json();
        setResource(data);
      } catch (error) {
        console.error("Failed to fetch resource:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchResource();
  }, [id]);

  return (
    <div className="flex min-h-screen"
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
          <SearchBar
              onTopicClick={(topic) => navigate(`/summary/${encodeURIComponent(topic)}`)}
              onSearchResults={({ query }) => navigate(`/query/${encodeURIComponent(query)}`)}
            />

            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : resource ? (
              <ResourcePage resource={resource} /> 
            ) : (
              <p className="text-gray-500 mt-6">Resource not found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
