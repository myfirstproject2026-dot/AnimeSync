import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMyProfile, getProfile, updateMyProfile } from "../services/api";
import "./Page.css";

export default function Profile() {
  const { username } = useParams();
  const isMe = username === "me";

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    avatarUrl: ""
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = isMe
          ? await getMyProfile()
          : await getProfile(username);

        setUser(data.user);

        setForm({
          displayName: data.user.display_name || "",
          bio: data.user.bio || "",
          avatarUrl: data.user.avatar_url || ""
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [username, isMe]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = await updateMyProfile(form);
      setUser(data.user);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="page">
        <div className="empty-state">
          <h2>Loading profile...</h2>
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="page">
        <div className="empty-state">
          <h2>Profile unavailable</h2>
          <p>{error || "User not found."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="profile-page">
        <div className="profile-hero">
          <div className="profile-avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name} />
            ) : (
              (user.display_name || user.username)
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div className="profile-info">
            <span className="eyebrow">CREATOR PROFILE</span>

            <h1>{user.display_name}</h1>

            <p className="profile-username">
              @{user.username}
            </p>

            {user.bio && <p className="profile-bio">{user.bio}</p>}

            {isMe && (
              <button
                className="button secondary"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit profile"}
              </button>
            )}
          </div>
        </div>

        {editing && (
          <form className="creator-form" onSubmit={handleSave}>
            <label>
              Display name
              <input
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                maxLength="80"
                required
              />
            </label>

            <label>
              Bio
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                maxLength="160"
                rows="4"
              />
            </label>

            <label>
              Avatar URL
              <input
                type="url"
                name="avatarUrl"
                value={form.avatarUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button
              className="button primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        )}

        <div className="profile-stats">
          <div>
            <strong>{user.posts_count ?? 0}</strong>
            <span>Posts</span>
          </div>

          <div>
            <strong>{user.followers_count ?? 0}</strong>
            <span>Followers</span>
          </div>

          <div>
            <strong>{user.following_count ?? 0}</strong>
            <span>Following</span>
          </div>
        </div>

        {!isMe && (
          <Link to="/create" className="button primary">
            Share your animation
          </Link>
        )}
      </div>
    </section>
  );
}
