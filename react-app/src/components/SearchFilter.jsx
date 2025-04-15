export default function SearchFilter({ selectedTypes = [], onToggleType = () => {} }) {
  const options = ["Article", "YouTube Video", "GitHub Repository", "Book"];

  return (
    <div className="sticky top-4 self-start">
      <div className="w-56 p-4 pb-6 border rounded-lg shadow-md bg-white h-fit space-y-6">
        <h2 className="text-lg font-bold">Refine your search</h2>

        <div>
          <h3 className="text-xs font-semibold text-emerald-300 uppercase">Content Type</h3>
          <ul className="mt-2 space-y-2">
            {options.map((label, index) => (
              <li key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={label}
                  checked={selectedTypes.includes(label)}
                  onChange={() => onToggleType(label)}
                  className="w-4 h-4 mr-2 accent-emerald-400"
                />
                <label htmlFor={label} className="text-sm">
                  {label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
