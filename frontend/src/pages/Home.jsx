import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeed } from "../services/api";
import "./Page.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeed() {
      try {
        const data = await getFeed();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  return (
    <section className="page">
      <div className="feed-header">
        <div>
          <span className="eyebrow">ANIMESYNC</span>
          <h1>Your animation feed.</h1>
        </div>

        <Link to="/explore" className="button secondary">
          Explore
        </Link>
      </div>

      {loading && (
        <div className="empty-state">
          <h2>Loading animation...</h2>
          <p>Bringing the latest work into your feed.</p>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <h2>Feed unavailable</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <h2>No posts yet.</h2>
          <p>
            AnimeSync is ready for its first creators.
          </p>
        </div>
      )}

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
          </article>
        ))}
      </div>
    </section>
  );
}
