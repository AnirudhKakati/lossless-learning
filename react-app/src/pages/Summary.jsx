export default function Summary() {

    return (
        <div className="ml-64 p-8 w-full overflow-auto">

            <div className="relative w-full max-w-md mb-6">
                        <input 
                        type="text" 
                        placeholder="Search lessons..." 
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        />
                        <svg 
                        className="absolute left-3 top-3 w-5 h-5 text-gray-500" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
                        </svg>
                    </div>

            <div className="absolute top-0 right-0 mt-8 mr-8 w-64 p-4 border rounded-lg shadow-md bg-white">
                    <h2 className="text-lg font-bold">Refine your search</h2>
            

                    <div className="mt-4">
                    <h3 className="text-xs font-semibold text-emerald-300 uppercase">
                        Content Type
                    </h3>
                    <ul className="mt-2 space-y-2">
                        {["Article", "Exercise", "Video", "Lessons"].map(
                        (item, index) => (
                            <li key={index} className="flex items-center">
                            <input type="checkbox" id={item} className="w-4 h-4 mr-2" />
                            <label htmlFor={item} className="text-sm">{item}</label>
                            </li>
                        )
                        )}
                    </ul>
                    </div>
            

                    <div className="mt-4">
                    <h3 className="text-xs font-semibold text-emerald-300 uppercase">Topics</h3>
                    <ul className="mt-2 space-y-2">
                        {[
                        "Foundational Mathematics",
                        "Programming Fundamentals",
                        "Classical Machine Learning",
                        "Deep Learning",
                        "MLOps"
                        ].map((item, index) => (
                        <li key={index} className="flex items-center">
                            <input type="checkbox" id={item} className="w-4 h-4 mr-2" />
                            <label htmlFor={item} className="text-sm">{item}</label>
                        </li>
                        ))}
                    </ul>
                    </div>
                </div>


        </div>
    );
  }