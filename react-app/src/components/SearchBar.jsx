import { FiSearch } from "react-icons/fi";

export default function SearchBar() {
    return (
        <div className="relative w-full mb-6">
                    <input
                        type="text"
                        placeholder="Search lessons..."
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
            <FiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
        </div>
    );
}