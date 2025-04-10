import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";
import { FaYoutube } from "react-icons/fa";

export default function Resource() {
  return (
    <div className= "flex bg-gray-100">
          <Navbar />
            <main className = "ml-64 p-8 w-full bg-gray-100">

                <div className= "flex gap-6 w-full max-w-full overflow-hidden">
                    <div className = "flex-1 min-w-0">
                    <SearchBar />


                    <div className="bg-white p-8 rounded-xl shadow-md">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-6 items-center mb-6">
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-300 shrink-0 transition-colors duration-200 group-hover:border-emerald-300">
                            <FaYoutube className="w-10 h-10 text-emerald-300" />
                          </div>
                            <div>
                              <h2 className="text-xl font-semibold text-gray-800">
                                YouTube Video
                              </h2>
                              <p className="text-emerald-300 font-semibold">
                                Data Cleaning/Data Preprocessing Before Building a Model - A Comprehensive Guide
                              </p>
                              <p className="text-gray-500 text-sm">
                                Data Preprocessing for Machine Learning | Classical Machine Learning
                              </p>
                            </div>
                        </div>
                          <p className="text-sm text-gray-500 pt-1">Jan 17, 2025</p>
                      </div>

                        <iframe
                          className="w-full rounded-md mb-8"
                          style={{ height: '500px' }}
                          src="https://www.youtube.com/embed/GP-2634exqA"
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>

                    </div>
                  </div>
              </div>
        </main>
    </div>
  );
}
