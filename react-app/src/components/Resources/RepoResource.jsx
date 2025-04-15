import { FiGithub } from "react-icons/fi";

export default function ArticleResource({ resource }) {
  
    if (!resource) {
        return <div className="text-gray-500">No resource found.</div>;
      }
    
      const {
        repo_name,
        repo_id,
        topic,
        domain,
        repo_stars,
        repo_url,
        sub_domain
      } = resource;
      
      let authorProfileUrl = null;

        if (repo_url) {
        try {
            const parts = new URL(repo_url).pathname.split("/").filter(Boolean);
            const username = parts[0];
            authorProfileUrl = `https://github.com/${username}`;
        } catch (err) {
            console.error("Invalid repo URL:", err);
        }
        }

    return (
     
        <div className="p-6 py-8 mt-20 bg-white rounded shadow">

    <div className="flex flex-col md:flex-row gap-8">
      {/* Icon */}
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white border border-gray-300 shrink-0">
        <FiGithub className="w-12 h-12 text-emerald-400" />
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Title */}
        <h2 className="text-3xl font-bold text-emerald-400 mb-6">
          {repo_name}
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
          </div>
        </div>

        {/* Navigation Section */}
        <div>
  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
    Navigation
  </h3>
  <div className="text-gray-700 space-y-2">
    <p>
      <span className="font-semibold">Repository URL: </span>
      <a 
        href={repo_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-500 hover:underline break-words"
      >
        {repo_url}
      </a>
    </p>

    {authorProfileUrl && (
      <p>
        <span className="font-semibold">Author Profile: </span>
        <a 
          href={authorProfileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:underline break-words"
        >
          {authorProfileUrl}
        </a>
      </p>
    )}

    {repo_id && (
      <p>
        <span className="font-semibold">Repository ID: </span> {repo_id}
      </p>
    )}

    {repo_stars !== undefined && (
      <p>
        <span className="font-semibold">Stars: </span> {repo_stars}
      </p>
    )}
  </div>
</div>
      </div>
    </div>

</div>


    );
  }