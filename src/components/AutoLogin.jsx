import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AutoLogin = () => {
  const navigate = useNavigate();

  const decodeToken = (token) => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const decoded = decodeToken(token);
    const currentTime = Date.now() / 1000;

    if (!decoded || decoded.exp < currentTime) {
      localStorage.removeItem("token");

      // Delay navigation until after alert closes
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please log in again.",
        confirmButtonColor: "#4f46e5",
      }).then(() => {
        navigate("/login");
      });

      return; // exit early to prevent further logic
    }

    // Only navigate if token is valid
    navigate("/GitScrum");
  }, [navigate]);

  return null;
};

export default AutoLogin;
