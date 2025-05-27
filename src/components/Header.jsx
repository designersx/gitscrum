import { Code } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const email = localStorage.getItem("email");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between px-4 sm:px-8">
        {/* Left: Logo and title */}
        <div className="flex items-center">
          <h1 className="text-4xl font-bold text-dark-900">
            <img
              src="/logo-without-lined-black.png"
              alt="Logo"
              className="h-14"
            />
          </h1>
        </div>

        {/* Right: Email and Logout */}
        <div className="flex items-center space-x-4">
          <span className="text-dark-700 text-sm">{email}</span>
          <button
            onClick={handleLogout}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Subtext */}
      <p className="text-center text-dark-500 mt-2 max-w-2xl mx-auto">
        Track and manage your development tasks across projects and sprints
      </p>
    </header>
  );
}
