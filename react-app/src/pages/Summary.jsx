import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar"
import SearchFilter from "../components/SearchFilter"
import SearchResults from "../components/SearchResults"

import { useState } from "react";

export default function Summary() {
  const [results, setResults] = useState([]);

  const fetchTopicData = async (topic) => {
    try {
      const res = await fetch(
        `https://lossless-learning-firestore-fastapi-203101603788.us-central1.run.app/resources?topic=${encodeURIComponent(topic)}`
       
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  return (
    <div className="flex bg-gray-100">
      <Navbar />

      <main className="ml-64 p-8 w-full bg-gray-100">
        <div className="flex gap-6 w-full max-w-full overflow-hidden">
          <div className="flex-1 min-w-0">
            <SearchBar onTopicClick={fetchTopicData} />
            <SearchResults data={results} />
          </div>
          <SearchFilter />
        </div>
      </main>
    </div>
  );
}
