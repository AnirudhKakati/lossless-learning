import { useState, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import data from "../../topics.json";

export default function SearchBar({ onTopicClick, onSearchResults, initialInput = "" }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSubdomains, setOpenSubdomains] = useState({});
  const [inputText, setInputText] = useState(initialInput);
  const [suggestions, setSuggestions] = useState([]);

  const toggleSubdomain = (key) => {
    setOpenSubdomains((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTopicClick = (topic) => {
    if (onTopicClick) {
      onTopicClick(topic);
    }
    setIsDropdownOpen(false);
    setSuggestions([]);
    setInputText("");
  };

  const handleSearchSubmit = (query) => {
    if (!query.trim()) return;
    if (onSearchResults) {
      onSearchResults({ query });
    }

    setIsDropdownOpen(false);
    setSuggestions([]);
    setInputText("");
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearchSubmit(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit(inputText);
    }
  };

  // Optional: Autocomplete API for inputText
  useEffect(() => {
    const controller = new AbortController();

    if (inputText.trim() === "") {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetch(
        `https://lossless-learning-autocomplete-fastapi-kbhge3in6a-uc.a.run.app/search/autocomplete?phrase=${encodeURIComponent(inputText)}`,
        { signal: controller.signal }
      )
        .then((res) => res.json())
        .then((data) => {
          setSuggestions((data.suggestions || []).filter(Boolean).slice(0, 5));
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.error("Autocomplete error:", err);
        });
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(delayDebounce);
    };
  }, [inputText]);

  return (
    <div className="w-full mb-2 pb-2 rounded-lg relative z-40">
      <div className="relative w-full">
        {/* Explore + Search input */}
        <div className="flex w-full">
          {/* Explore Button */}
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="h-12 px-3 flex items-center gap-1 bg-emerald-500 text-white font-medium rounded-l-md hover:bg-emerald-600 transition border border-gray-300 border-r-0 z-10"
          >
            Explore
            <FiChevronDown
              className={`w-4 h-4 transform transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Search Input */}
          <div className="relative w-full">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search resources or ask a question..."
              className="w-full h-12 p-3 pl-10 border border-gray-300 rounded-r-md focus:outline-none focus:border-emerald-300 transition-colors duration-200"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 top-full w-full bg-white border border-gray-300 border-t-0 shadow-lg rounded-b-md z-50 max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explore Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-[100%] left-0 w-full bg-white border border-t-0 rounded-b-md shadow-xl z-40 max-h-[500px] overflow-y-auto">
            {Object.entries(data).map(([domain, subdomains]) => (
              <div key={domain} className="p-4 border-b">
                <h3 className="text-md font-bold text-emerald-700">{domain}</h3>
                {Object.entries(subdomains).map(([subdomain, topics]) => {
                  const key = `${domain}__${subdomain}`;
                  const isOpen = openSubdomains[key];
                  return (
                    <div key={subdomain} className="ml-4 mt-2">
                      <button
                        onClick={() => toggleSubdomain(key)}
                        className="text-sm font-semibold text-gray-800 flex items-center gap-1 hover:text-emerald-600"
                      >
                        {subdomain}
                        <FiChevronDown
                          className={`w-4 h-4 transform transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <ul className="ml-4 mt-1 list-disc text-sm text-gray-600">
                          {Object.keys(topics).map((topic) => (
                            <li
                              key={topic}
                              onClick={() => handleTopicClick(topic)}
                              className="cursor-pointer hover:text-emerald-600"
                            >
                              {topic}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
