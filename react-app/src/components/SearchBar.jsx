import { FiSearch } from "react-icons/fi";

export default function SearchBar() {
    return (
        <div className="relative w-full mb-6 bg-gray-100 p-2 rounded-lg overflow-hidden">
        <input
          type="text"
          placeholder="Search lessons..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-300 transition-colors duration-2000"
        />
        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      </div>
    );
}