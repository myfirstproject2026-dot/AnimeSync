import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./MainLayout.css";

export default function MainLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("animesync_token");

  function handleLogout() {
    localStorage.removeItem("animesync_token");
    navigate("/");
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

          {token ? (
            <>
              <NavLink to="/create" className="create-link">
                Create
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

        {token ? (
          <>
            <NavLink to="/create">
              Create
            </NavLink>

            <button type="button" onClick={handleLogout}>
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
