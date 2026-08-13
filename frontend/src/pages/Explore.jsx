import { useEffect, useState } from "react";
import { getExplore } from "../services/api";
import "./Page.css";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExplore() {
      try {
        const data = await getExplore();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadExplore();
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <span className="eyebrow">DISCOVER</span>
        <h1>Explore animation.</h1>
        <p>
          Discover work and creators from across the animation ecosystem.
        </p>
      </div>

      {loading && (
        <div className="empty-state">
          <h2>Loading discovery...</h2>
          <p>Finding animation from across AnimeSync.</p>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <h2>Explore unavailable</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <h2>No discoveries yet.</h2>
          <p>Creators will appear here as the ecosystem grows.</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="feed">
          {posts.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-author">
                <div className="post-avatar">
                  {(post.display_name || post.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>{post.display_name}</strong>
                  <span>@{post.username}</span>
                </div>
              </div>

              {post.media_url && (
                <div className="post-media">
                  {post.content_type === "image" ? (
                    <img
                      src={post.media_url}
                      alt={post.caption || "Animation"}
                    />
                  ) : (
                    <video
                      src={post.media_url}
                      poster={post.thumbnail_url || undefined}
                      controls
                      preload="metadata"
                    />
                  )}
                </div>
              )}

              {post.external_url && !post.media_url && (
                <a
                  className="external-post"
                  href={post.external_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open animation
                </a>
              )}

              {post.caption && (
                <p className="post-caption">{post.caption}</p>
              )}

              {post.tags?.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}

              <div className="post-tags">
                <span>♥ {post.like_count ?? 0}</span>
                <span>💬 {post.comment_count ?? 0}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
