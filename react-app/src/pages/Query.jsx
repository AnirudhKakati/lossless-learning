import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import SearchBarResults from "../components/SearchBarResults";

export default function Query() {
  const { question } = useParams();
  const navigate = useNavigate();

  const [qaResult, setQaResult] = useState(null);
  const [qaContext, setQaContext] = useState([]);
  const [inputText, setInputText] = useState(question ? decodeURIComponent(question) : "");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch /ask result when URL param changes
  useEffect(() => {
    if (!question) {
      setQaResult(null);
      setQaContext([]);
      setInputText("");
      return;
    }

    const fetchQA = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("https://lossless-learning-search-fastapi-kbhge3in6a-uc.a.run.app/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: decodeURIComponent(question) }),
        });

        const data = await res.json();
        setQaResult({ query: decodeURIComponent(question), result: data });
      } catch (err) {
        console.error("Failed to fetch answer:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQA();
  }, [question]);

  // Enrich YouTube resources in context
  useEffect(() => {
    if (!qaResult?.result?.response?.response?.context) return;

    const enrichContext = async () => {
      const contexts = qaResult.result.response.response.context;

      const enriched = await Promise.all(
        contexts.map(async (item) => {
          if (item.link && item.id) {
            try {
              const res = await fetch(
                `https://lossless-learning-firestore-fastapi-203101603788.us-central1.run.app/resource/id=${item.id}`
              );
              const data = await res.json();
              return data.length > 0 ? data[0] : item;
            } catch (err) {
              console.error("Error fetching resource by ID:", err);
              return item;
            }
          } else {
            return item;
          }
        })
      );

      setQaContext(enriched);
    };

    enrichContext();
  }, [qaResult]);

  return (
    <div className="flex min-h-screen overflow-x-hidden"
    style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='none' stroke='%23e5e7eb' stroke-width='1' d='M0 0h48v48H0z M24 0v48 M0 24h48'/%3E%3C/svg%3E\")",
        backgroundSize: "48px 48px",
      }}
    >
      <Navbar />
      <main className="ml-64 p-8 w-full max-w-full overflow-x-hidden">
        <SearchBar
          onTopicClick={(topic) => navigate(`/summary/${encodeURIComponent(topic)}`)}
          onSearchResults={({ query }) => navigate(`/query/${encodeURIComponent(query)}`)}
        />

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px] mt-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          qaResult && (
            <SearchBarResults
              query={qaResult.query}
              answer={qaResult.result.response.response.answer}
              context={qaContext}
            />
          )
        )}
      </main>
    </div>
  );
}
