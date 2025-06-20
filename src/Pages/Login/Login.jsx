import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code } from "lucide-react";
import { sendOTP, verifyOTP } from "../../lib/store";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isDesignersXEmail = (email) => {
    return (
      email.endsWith("@designersx.com") || email.endsWith("@designersx.in")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!otpSent) {
      if (!email) {
        setError("Please enter your email.");
        setLoading(false);
        return;
      }

      const allowedEmails = [
        "shoryaverma.dx@gmail.com",
        "niraj.t@designersx.com",
        "summi.b.singh@gmail.com",
        "ritu.beniwal@designersx.com",
        "kush.sharma@designersx.com",
        "ksvilkhu@gmail.com",
        "summi@designersx.com",
        "kulbir@designersx.com",
      ];
      //   if (!isDesignersXEmail(email)) {
      //     setError("Only DesignersX email addresses are allowed.");
      //     setLoading(false);
      //     return;
      //   }
      // Check if the email is one of the allowed emails
      const emailLower = email.toLowerCase();
      if (!allowedEmails.map((e) => e.toLowerCase()).includes(emailLower)) {
        setError("This email is not authorized to log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await sendOTP(email);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to send OTP");
        } else {
          setOtpSent(true);
          setSuccess("OTP sent to your email.");
        }
      } catch (err) {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await verifyOTP(email, otp);
        const data = await res.json();

        if (!res.ok || !data.status) {
          setError(data.message || "OTP verification failed");
        } else {
          if (data.status === true) {
            setSuccess("OTP verified successfully!");

            // Save token to localStorage or sessionStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", email);

            setTimeout(() => {
              navigate("/GitScrum");
            }, 1500);
          }
        }
      } catch (err) {
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center items-center mb-3">
          <h1 className="text-4xl font-bold text-dark-900">
            <img
              src="/logo-without-lined-black.png"
              alt="Logo"
              className="h-14"
            />
          </h1>
        </div>
        <p className="text-gray-500">
          Track and manage your development tasks across projects and sprints
        </p>
      </div>

      {/* Card */}
      <div className="max-w-md mx-auto bg-gray-100 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-primary-600 mb-6">
          Login
        </h2>

        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 text-center mb-4">{success}</p>
        )}
        {loading && (
          <p className="text-sm text-blue-700 text-center mb-4">Sending...</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
              className={`mt-1 block w-full px-4 py-2 ${
                otpSent ? "bg-gray-100 text-gray-500" : "bg-white text-gray-900"
              } border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600`}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* OTP Field */}
          {otpSent && (
            <div className="transition-all duration-300 ease-in-out">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Enter OTP sent to your email
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="6-digit code"
                required
              />
            </div>
          )}

          {/* Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md transition disabled:opacity-50"
              disabled={loading}
            >
              {otpSent ? "Verify & Login" : "Send OTP"}
            </button>
          </div>
        </form>

        {/* Optional Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
