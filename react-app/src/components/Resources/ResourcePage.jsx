

// import VideoDetails from "./VideoDetails";
// import ArticleDetails from "./ArticleDetails";
// import RepoDetails from "./RepoDetails";

export default function ResourcePage({ resource }) {
  if (!resource) {
    return <div className="p-4">Resource not found.</div>;
  }

  const { resource_type } = resource;

  return (
    <div className="p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{resource_type}</h1>
      <p className="mb-4">{resource.description || "No description provided."}</p>

      {/* Render type-specific components
      {resource_type === "videos" && <VideoDetails data={resource} />}
      {resource_type === "articles" && <ArticleDetails data={resource} />}
      {resource_type === "github_repos" && <RepoDetails data={resource} />} */}
    </div>
  );
}
