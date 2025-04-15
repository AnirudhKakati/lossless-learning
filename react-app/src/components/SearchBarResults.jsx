import { useEffect, useState } from "react";
import { FiBookOpen, FiGithub } from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LikeButton from "./LikeButton";
import ReactMarkdown from "react-markdown";

const API_BASE = "https://lossless-learning-cloudsql-fastapi-kbhge3in6a-uc.a.run.app";

export default function SearchBarResults({ query, answer, context }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [enrichedContext, setEnrichedContext] = useState([]);
  const [likeDataLoaded, setLikeDataLoaded] = useState(false);

  useEffect(() => {
    const fetchLikeData = async () => {
      if (!userId || !context || context.length === 0) {
        setEnrichedContext(context || []);
        setLikeDataLoaded(true);
        return;
      }

      try {
        const [likedRes, countsArr] = await Promise.all([
          fetch(`${API_BASE}/users/${userId}/likes`).then((res) => res.json()),
          Promise.all(
            context
              .filter((item) => item.resource_id)
              .map((item) =>
                fetch(`${API_BASE}/resources/${item.resource_id}/likes`)
                  .then((res) => res.json())
                  .then((json) => ({ [item.resource_id]: json.like_count || 0 }))
              )
          ),
        ]);

        const normalizedLiked = likedRes.map((id) => id.toString());
        const likeCountMap = Object.assign({}, ...countsArr);

        const enriched = context.map((item) => ({
          ...item,
          liked: normalizedLiked.includes(item.resource_id),
          likeCount: likeCountMap[item.resource_id] || 0,
        }));

        setEnrichedContext(enriched);
        setLikeDataLoaded(true);
      } catch (err) {
        console.error("Error fetching like data:", err);
        setEnrichedContext(context || []);
        setLikeDataLoaded(true);
      }
    };

    fetchLikeData();
  }, [context, userId]);

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "videos":
        return <FaYoutube className="w-6 h-6 text-emerald-300" />;
      case "github_repos":
        return <FiGithub className="w-6 h-6 text-emerald-500" />;
      default:
        return <FiBookOpen className="w-6 h-6 text-emerald-500" />;
    }
  };

  const extractTitle = (item) =>
    item.video_title?.length > 60 ? item.video_title.slice(0, 57) + "..." : item.video_title;

  const formatDescription = (item) =>
    `${item.topic || "Unknown Topic"} | ${item.domain || "Unknown Domain"}`;

  const handleCardClick = (resource_id) => {
    navigate(`/resource/${resource_id}`);
  };

  if (!likeDataLoaded) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mt-10" />
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-full overflow-x-hidden">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-emerald-700 mb-2">
          Search Result for: <span className="text-gray-900">{query}</span>
        </h2>
        <div className="text-sm text-gray-800 whitespace-pre-wrap">
            <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
      </div>

      {enrichedContext && enrichedContext.length > 0 && (
        <div className="grid gap-4 w-full max-w-full px-2">
          {enrichedContext.map((item, index) => (
            <div
              key={index}
              onClick={() =>
                item.id && item.resource_type === "videos" && handleCardClick(item.resource_id)
              }
              className={`group p-3 flex items-center gap-3 border rounded-md shadow-sm bg-white relative transition-colors duration-200 hover:border-emerald-300 hover:bg-emerald-50 ${
                item.resource_type === "videos" ? "cursor-pointer" : ""
              }`}
            >
              <p className="absolute top-3 right-3 text-gray-500 text-xs hidden sm:block">
                {item.date}
              </p>

              {item.resource_type === "videos" && item.resource_id && (
                <LikeButton
                  resourceId={item.resource_id}
                  initialLiked={item.liked}
                  initialCount={item.likeCount}
                />
              )}

              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-300 shrink-0 group-hover:border-emerald-300 transition-colors">
                {getIcon(item.resource_type)}
              </div>

              <div className="flex-1 min-w-0">
                {item.resource_type === "videos" ? (
                  <>
                    <p className="text-emerald-300 mb-1 text-md font-bold truncate">
                      {extractTitle(item)}
                    </p>
                    <p className="text-gray-700 mb-1 text-sm font-bold truncate">
                      {formatDescription(item)}
                    </p>
                    <p className="text-gray-600 text-sm truncate">YouTube Video</p>
                  </>
                ) : (
                  <>
                    <p className="text-emerald-300 mb-1 text-md font-bold truncate">
                      {item.book_title}
                    </p>
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-semibold">Author:</span> {item.author}
                    </p>
                    <p
                      className="text-gray-700 text-sm break-words mb-1"
                      dangerouslySetInnerHTML={{ __html: item.page_snippet }}
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Page {item.page_no}</span>
                      <a
                        href={`${item.public_url}#page=${item.page_no}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 underline"
                      >
                        View
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
