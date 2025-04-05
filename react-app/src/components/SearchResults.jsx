import { FiBookOpen } from "react-icons/fi";

export default function SearchResults() {
    return (  
        <div className="space-y-3">
                <div className="group p-3 flex gap-3 border rounded-md shadow-sm bg-white relative">
                  <p className="absolute top-3 right-3 text-gray-500 text-xs">Jan 17, 2025</p>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300">
                    <div className="flex items-center justify-center w-full h-full">
                        <FiBookOpen size={24} className="text-gray-600" />  
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-medium">Article</p>
                    <p className="text-emerald-300 text-base font-semibold truncate">ML | Data Preprocessing in Python | GeeksforGeeks</p>
                    <p className="text-gray-600 text-xs truncate">Data Preprocessing for Machine Learning | Classical Machine Learning</p>
                  </div>
                </div>
            </div>
    );
}