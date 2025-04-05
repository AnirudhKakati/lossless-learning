export default function SearchFilter() {
    return (
        <div className="w-64 p-4 border rounded-lg shadow-md bg-white h-fit">
        <h2 className="text-lg font-bold">Refine your search</h2>
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-emerald-300 uppercase">Content Type</h3>
          <ul className="mt-2 space-y-2">
            {["Article", "Youtube Video", "Github Repository"].map((item, index) => (
              <li key={index} className="flex items-center">
                <input type="checkbox" id={item} className="w-4 h-4 mr-2" />
                <label htmlFor={item} className="text-sm">
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-emerald-300 uppercase">Domain</h3>
          <ul className="mt-2 space-y-2">
            {[
              "Foundational Mathematics",
              "Programming Fundamentals",
              "Classical Machine Learning",
              "Deep Learning",
              "MLOps",
            ].map((item, index) => (
              <li key={index} className="flex items-center">
                <input type="checkbox" id={item} className="w-4 h-4 mr-2" />
                <label htmlFor={item} className="text-sm">
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  