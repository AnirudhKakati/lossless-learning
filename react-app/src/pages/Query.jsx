import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import SearchBarResults from "../components/SearchBarResults";

export default function Query() {
  const { question } = useParams();
  const navigate = useNavigate();

  const [qaResult, setQaResult] = useState(null);
  const [enrichedContext, setEnrichedContext] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch QA result from /ask
  useEffect(() => {
    if (!question) {
      setQaResult(null);
      setEnrichedContext([]);
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
        console.error("Failed to fetch QA result:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQA();
  }, [question]);

  // Enrich resource context using IDs
  useEffect(() => {
    const context = qaResult?.result?.response?.response?.context;
    if (!context || context.length === 0) return;

    const enrich = async () => {
      const enriched = await Promise.all(
        context.map(async (item) => {
          if (item.id) {
            try {
              const res = await fetch(
                `https://lossless-learning-firestore-fastapi-203101603788.us-central1.run.app/resource/${item.id}`
              );
              const data1 = await res.json();
              console.log("data1:", data1);

              if (data1 && typeof data1 === "object" && Object.keys(data1).length > 0) {
                const enrichedItem = { ...data1, resource_id: item.id };
                console.log("Enriched item:", enrichedItem);
                return enrichedItem;
              }
            } catch (err) {
              console.error(`Failed to enrich item with ID ${item.id}:`, err);
            }
          }

          console.log("⚠️ No enrichment for item:", item);
          return item;
        })
      );

      setEnrichedContext(enriched);
    };

    enrich();
  }, [qaResult]);

  return (
    <div
      className="flex w-full overflow-x-hidden min-h-screen"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='none' stroke='%23e5e7eb' stroke-width='1' d='M0 0h48v48 M24 0v48 M0 24h48'/%3E%3C/svg%3E\")",
        backgroundSize: "48px 48px",
      }}
    >
      {/* Sidebar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
        <SearchBar
          onTopicClick={(topic) => navigate(`/summary/${encodeURIComponent(topic)}`)}
          onSearchResults={({ query }) => navigate(`/query/${encodeURIComponent(query)}`)}
        />

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px] mt-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : (
          qaResult && (
            <SearchBarResults
              query={qaResult.query}
              answer={qaResult.result.response.response.answer}
              context={enrichedContext}
            />
          )
        )}
      </main>
    </div>
  );
}
