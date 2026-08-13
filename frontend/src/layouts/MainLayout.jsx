import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./MainLayout.css";

export default function MainLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          AnimeSync
        </NavLink>

        <nav className="topnav">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/explore">
            Explore
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/create" className="create-link">
                Create
              </NavLink>

              <NavLink to="/profile/me">
                Profile
              </NavLink>

              <button
                type="button"
                className="nav-button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login">
              Login
            </NavLink>
          )}
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="mobile-nav">
        <NavLink to="/" end>
          Home
        </NavLink>

        <NavLink to="/explore">
          Explore
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/create">
              Create
            </NavLink>

            <NavLink to="/profile/me">
              Profile
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </>
        ) : (
          <NavLink to="/login">
            Login
          </NavLink>
        )}
      </nav>
    </div>
  );
}