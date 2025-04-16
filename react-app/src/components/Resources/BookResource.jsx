import { FiBookOpen } from "react-icons/fi";

export default function BookResource({ resource }) {
  
    if (!resource) {
        return <div className="text-gray-500">No resource found.</div>;
      }
    
      const {
        book_title,
        topic,
        domain,
        page_snippet,
        public_url,
        page_no,
        sub_domain
      } = resource;
      
    return (
     
        <div className="p-6 py-8 mt-6 bg-white rounded shadow border border-gray-300">

    <div className="flex flex-col md:flex-row gap-8">
      {/* Icon */}
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white border border-gray-300 shrink-0">
        <FiBookOpen className="w-12 h-12 text-gray-600" />
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Title */}
        <h2 className="text-3xl font-bold text-emerald-500 mb-6">
          {book_title}
        </h2>

        {/* Information Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            Information
          </h3>
          <div className="text-gray-700 space-y-2">
            <p><span className="font-semibold">Domain:</span> {domain}</p>
            <p><span className="font-semibold">Sub-domain:</span> {sub_domain}</p>
            <p><span className="font-semibold">Topic:</span> {topic}</p>
            <p><span className="font-semibold">Snippet:</span> {page_snippet}</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            Navigation
          </h3>
          <div className="text-gray-700 space-y-2">
            <p><span className="font-semibold">URL Link: </span> 
                <a 
                 href={`https://${public_url}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline break-words"
                >
                {public_url}
              </a>
            </p>
            <p>
              <span className="font-semibold">Page Number: </span>
              {page_no}
            </p>
          </div>
        </div>
      </div>
    </div>

</div>


    );
  }