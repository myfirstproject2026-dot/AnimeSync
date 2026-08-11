import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/api";
import "./Page.css";

export default function CreatePost() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    contentType: "image",
    mediaUrl: "",
    externalUrl: "",
    caption: "",
    tags: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("animesync_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!form.mediaUrl.trim() && !form.externalUrl.trim()) {
      setError("Add a media URL or external URL.");
      return;
    }

    setLoading(true);

    try {
      await createPost({
        contentType: form.contentType,
        mediaUrl: form.mediaUrl.trim() || null,
        externalUrl: form.externalUrl.trim() || null,
        caption: form.caption.trim() || null,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        visibility: "public"
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <div className="creator-page">
        <span className="eyebrow">CREATE</span>

        <h1>Share your animation.</h1>

        <p className="page-intro">
          Put your work in front of the AnimeSync community.
        </p>

        <form className="creator-form" onSubmit={handleSubmit}>
          <label>
            Content type
            <select
              name="contentType"
              value={form.contentType}
              onChange={handleChange}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="animation">Animation</option>
              <option value="link">External link</option>
            </select>
          </label>

          <label>
            Media URL
            <input
              type="url"
              name="mediaUrl"
              value={form.mediaUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <div className="form-divider">or</div>

          <label>
            External URL
            <input
              type="url"
              name="externalUrl"
              value={form.externalUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <label>
            Caption
            <textarea
              name="caption"
              value={form.caption}
              onChange={handleChange}
              placeholder="Tell the community about your work..."
              maxLength="2000"
              rows="6"
            />
          </label>

          <label>
            Tags
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="anime, animation, 2d, character"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            className="button primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish animation"}
          </button>
        </form>
      </div>
    </section>
  );
}
