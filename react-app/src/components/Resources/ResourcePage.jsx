

import VideoResource from "./VideoResource";
import ArticleResource from "./ArticleResource";
import RepoResource from "./RepoResource";
import BookResource from "./BookResource";

export default function ResourcePage({ resource }) {
  if (!resource) {
    return <div className="p-4">Resource not found.</div>;
  }

  const { resource_type } = resource;

  return (
    <div>
      {resource_type === "videos" && <VideoResource resource={resource} />}
      {resource_type === "articles" && <ArticleResource resource={resource} />}
      {resource_type === "github_repos" && <RepoResource resource={resource} />}
      {resource_type === "book_content" && <BookResource resource={resource} />}
    </div>
  );
}
