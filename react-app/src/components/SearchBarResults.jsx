import { FiBookOpen, FiGithub } from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";

export default function SearchBarResults({ query, answer, context }) {
  
    console.log("SearchBarResults context:", context);


    const getIcon = (type) => {
    switch (type) {
      case "youtube":
        return <FaYoutube className="w-6 h-6 text-rose-500" />;
      case "github":
        return <FiGithub className="w-6 h-6 text-gray-800" />;
      default:
        return <FiBookOpen className="w-6 h-6 text-emerald-500" />;
    }
  };

  return (
    <div className="mt-8 w-full max-w-full overflow-x-hidden">

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-emerald-700 mb-2">
          Search Result for: <span className="text-gray-900">{query}</span>
        </h2>
        <div className="text-sm text-gray-800 whitespace-pre-wrap">{answer}</div>
      </div>


      {context && context.length > 0 && (
        <div className="grid gap-4 w-full max-w-full px-2">
          {context.map((item, index) => (
            <div
              key={index}
              className="group p-3 flex items-center gap-3 border rounded-md shadow-sm bg-white relative transition-colors duration-200 hover:border-emerald-300 hover:bg-emerald-50 w-full max-w-full"
            >

              <p className="absolute top-3 right-3 text-gray-500 text-xs hidden sm:block">
                {item.date}
              </p>


              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-300 shrink-0 transition-colors duration-200 group-hover:border-emerald-300">
                {getIcon(item.resource_type)}
              </div>


              <div className="flex-1 min-w-0">

                {item.resource_type === "videos" || item.resource_type === "github" ? (
                  <>
                    <p className="text-emerald-300 mb-1 text-md font-bold truncate">
                      {item.title || item.video_title || "Untitled"}
                    </p>
                    <p className="text-gray-700 text-sm break-words">
                      {item.description}
                    </p>
                  </>
                ) : (

                  <>
                    <p className="text-emerald-300 mb-1 text-md font-bold truncate">
                      {item.book_title}
                    </p>
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-semibold">Author:</span> {item.author}
                    </p>
                    <p
                      className="text-gray-700 text-sm break-words mb-1"
                      dangerouslySetInnerHTML={{ __html: item.page_snippet }}
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Page {item.page_no}</span>
                      <a
                        href={`${item.public_url}#page=${item.page_no}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 underline"
                      >
                        View
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
