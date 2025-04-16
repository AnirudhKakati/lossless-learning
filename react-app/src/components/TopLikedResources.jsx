import { useEffect, useState } from "react";
import { FiBookOpen, FiGithub, FiFileText } from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LikeButton from "./LikeButton";

const MOST_LIKED_ENDPOINT =
  "https://lossless-learning-cloudsql-fastapi-203101603788.us-central1.run.app/resources/most_liked";
const FIRESTORE_BASE =
  "https://lossless-learning-firestore-fastapi-203101603788.us-central1.run.app";

function getIcon(type) {
  const baseClass =
    "h-5 w-5 text-gray-600 transition-colors duration-200 group-hover:text-emerald-400";
  switch (type?.toLowerCase()) {
    case "videos":
      return <FaYoutube className={baseClass} />;
    case "github_repos":
      return <FiGithub className={baseClass} />;
    case "books":
    case "book_content":
      return <FiBookOpen className={baseClass} />;
    case "articles":
    default:
      return <FiFileText className={baseClass} />;
  }
}

export default function TopLikedResources({ onLoadComplete }) {
  const [resources, setResources] = useState([]);
  const [likeCounts, setLikeCounts] = useState({});
  const [likedResources, setLikedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchMostLikedResources = async () => {
      try {
        const res = await fetch(MOST_LIKED_ENDPOINT);
        const ids = await res.json();

        const details = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${FIRESTORE_BASE}/resource/${id}`);
            const data = await res.json();
            return { ...data, resource_id: id };
          })
        );
        setResources(details);

        const counts = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(
              `${MOST_LIKED_ENDPOINT.replace("/most_liked", "")}/${id}/likes`
            );
            const data = await res.json();
            return { [id]: data.like_count || 0 };
          })
        );
        setLikeCounts(Object.assign({}, ...counts));

        if (userId) {
          const res = await fetch(
            `${MOST_LIKED_ENDPOINT.replace(
              "/resources/most_liked",
              `/users/${userId}/likes`
            )}`
          );
          const liked = await res.json();
          setLikedResources(liked || []);
        }
      } catch (err) {
        console.error("Error loading most liked resources:", err);
      } finally {
        setLoading(false);
        if (onLoadComplete) onLoadComplete();
      }
    };

    fetchMostLikedResources();
  }, []);

  if (loading || resources.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-semibold mb-4">Most Liked Resources</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
        {resources.map((res) => (
          <div
            key={res.resource_id}
            onClick={() => navigate(`/resource/${res.resource_id}`)}
            className="relative bg-white cursor-pointer rounded-lg shadow-sm p-4 flex flex-col justify-between min-h-[160px] border border-gray-300 group hover:bg-emerald-50 border-emerald-300 transition-colors duration-200"
          >
            <div className="absolute top-2 right-2">
              <LikeButton
                resourceId={res.resource_id}
                initialLiked={likedResources.includes(res.resource_id)}
                initialCount={likeCounts[res.resource_id] ?? 0}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 group-hover:border-emerald-300 transition-colors">
                  {getIcon(res.resource_type)}
                </div>
                <p className="text-sm text-gray-600">
                  {(() => {
                    switch (res.resource_type?.toLowerCase()) {
                      case "videos":
                        return "YouTube Video";
                      case "github_repos":
                        return "GitHub Repository";
                      case "book_content":
                        return "Book";
                      default:
                        return "Article";
                    }
                  })()}
                </p>
              </div>

              <div className="text-md font-bold text-emerald-500 break-words pt-1">
                {(() => {
                  const title =
                    res.repo_name ||
                    res.video_title ||
                    res.title ||
                    res.book_title ||
                    "Untitled";
                  return title.length > 60
                    ? title.slice(0, 57) + "..."
                    : title;
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
