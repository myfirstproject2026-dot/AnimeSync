import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMyProfile,
  getProfile,
  updateMyProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from "../services/api";
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

  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [followers, setFollowers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const [connectionsOpen, setConnectionsOpen] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");

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

        setFollowing(Boolean(data.user.is_following));
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

      setForm({
        displayName: data.user.display_name || "",
        bio: data.user.bio || "",
        avatarUrl: data.user.avatar_url || ""
      });

      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleFollow() {
    if (!user) return;

    setFollowLoading(true);
    setError("");

    try {
      if (following) {
        await unfollowUser(user.id);

        setFollowing(false);

        setUser((current) => ({
          ...current,
          followers_count: Math.max(
            Number(current.followers_count || 0) - 1,
            0
          )
        }));
      } else {
        await followUser(user.id);

        setFollowing(true);

        setUser((current) => ({
          ...current,
          followers_count:
            Number(current.followers_count || 0) + 1
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowLoading(false);
    }
  }

  async function toggleConnections(type) {
    setError("");

    if (connectionsOpen === type) {
      setConnectionsOpen("");
      return;
    }

    setConnectionsOpen(type);
    setConnectionsLoading(true);

    try {
      if (type === "followers") {
        const data = await getFollowers(user.id);
        setFollowers(data.users || []);
      }

      if (type === "following") {
        const data = await getFollowing(user.id);
        setFollowingUsers(data.users || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setConnectionsLoading(false);
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
              <img
                src={user.avatar_url}
                alt={user.display_name || user.username}
              />
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

            {user.bio && (
              <p className="profile-bio">
                {user.bio}
              </p>
            )}

            {isMe ? (
              <button
                type="button"
                className="button secondary"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit profile"}
              </button>
            ) : (
              <button
                type="button"
                className="button primary"
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading
                  ? "Please wait..."
                  : following
                    ? "Following"
                    : "Follow"}
              </button>
            )}
          </div>
        </div>

        {editing && (
          <form
            className="creator-form"
            onSubmit={handleSave}
          >
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

            {error && (
              <p className="form-error">{error}</p>
            )}

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
          <button
            type="button"
            onClick={() => toggleConnections("followers")}
          >
            <strong>{user.followers_count ?? 0}</strong>
            <span>Followers</span>
          </button>

          <button
            type="button"
            onClick={() => toggleConnections("following")}
          >
            <strong>{user.following_count ?? 0}</strong>
            <span>Following</span>
          </button>

          <div>
            <strong>{user.posts_count ?? 0}</strong>
            <span>Posts</span>
          </div>
        </div>

        {error && !editing && (
          <p className="form-error">{error}</p>
        )}

        {connectionsOpen && (
          <div className="profile-connections">
            <div className="connections-header">
              <strong>
                {connectionsOpen === "followers"
                  ? "Followers"
                  : "Following"}
              </strong>
            </div>

            {connectionsLoading && (
              <p className="comments-status">
                Loading...
              </p>
            )}

            {!connectionsLoading &&
              connectionsOpen === "followers" &&
              followers.length === 0 && (
                <p className="comments-status">
                  No followers yet.
                </p>
              )}

            {!connectionsLoading &&
              connectionsOpen === "following" &&
              followingUsers.length === 0 && (
                <p className="comments-status">
                  Not following anyone yet.
                </p>
              )}

            {!connectionsLoading &&
              connectionsOpen === "followers" &&
              followers.length > 0 && (
                <div className="connections-list">
                  {followers.map((person) => (
                    <Link
                      key={person.id}
                      to={`/profile/${person.username}`}
                      className="connection-item"
                    >
                      <div className="connection-avatar">
                        {person.avatar_url ? (
                          <img
                            src={person.avatar_url}
                            alt={
                              person.display_name ||
                              person.username
                            }
                          />
                        ) : (
                          (
                            person.display_name ||
                            person.username ||
                            "?"
                          )
                            .charAt(0)
                            .toUpperCase()
                        )}
                      </div>

                      <div>
                        <strong>
                          {person.display_name ||
                            person.username}
                        </strong>
                        <span>@{person.username}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

            {!connectionsLoading &&
              connectionsOpen === "following" &&
              followingUsers.length > 0 && (
                <div className="connections-list">
                  {followingUsers.map((person) => (
                    <Link
                      key={person.id}
                      to={`/profile/${person.username}`}
                      className="connection-item"
                    >
                      <div className="connection-avatar">
                        {person.avatar_url ? (
                          <img
                            src={person.avatar_url}
                            alt={
                              person.display_name ||
                              person.username
                            }
                          />
                        ) : (
                          (
                            person.display_name ||
                            person.username ||
                            "?"
                          )
                            .charAt(0)
                            .toUpperCase()
                        )}
                      </div>

                      <div>
                        <strong>
                          {person.display_name ||
                            person.username}
                        </strong>
                        <span>@{person.username}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
          </div>
        )}

        {!isMe && (
          <Link
            to="/create"
            className="button primary"
          >
            Share your animation
          </Link>
        )}
      </div>
    </section>
  );
}