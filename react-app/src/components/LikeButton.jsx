import { useState } from 'react';

const API_BASE = 'https://lossless-learning-cloudsql-fastapi-kbhge3in6a-uc.a.run.app';

export default function LikeButton({ resourceId, initialLiked, initialCount }) {
  const userId = localStorage.getItem('user_id') || null;
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async (e) => {
    e.stopPropagation();
    if (!userId || loading) return;

    setLoading(true);
    const endpoint = liked ? '/unlike' : '/like';
    
    // Post like or unlike data
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId, user_id: userId }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        console.error('API Error:', error);
        return;
      }

      const newLiked = !liked;
      setLiked(newLiked);
      setLikeCount((prev) => prev + (newLiked ? 1 : -1));
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading || !userId}
      className="absolute top-2 right-2 flex items-center gap-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 20 20"
        fill={liked ? 'rgb(16 185 129)' : 'white'}
        stroke={liked ? 'rgb(16 185 129)' : 'rgb(156 163 175)'}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        />
      </svg>
      <span className="text-sm font-medium text-gray-600 w-6 text-left">{likeCount}</span>
    </button>
  );
}
