import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser,
  FaLock,
  FaLinkedin,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaGoogle,
} from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      setErrorMessage("Please fix the errors above");
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setSuccessMessage("Login successful! Redirecting...");
        setFormData({ email: "", password: "", rememberMe: false });

        setTimeout(() => {
          const role = result.user?.role?.toUpperCase();
          if (role === "ADMIN") {
            navigate("/admin/dashboard");
          } else if (role === "HR") {
            navigate("/hr/dashboard");
          } else if (role === "EMPLOYEE") {
            navigate("/employee/dashboard");
          } else {
            navigate("/login");
          }
        }, 1500);
      } else {
        setErrorMessage(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => console.log("Google login clicked");
  const handleLinkedInLogin = () => console.log("LinkedIn login clicked");

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/request-password");
  };

  return (
    <div className="container-fluid vw-100 vh-100 p-0">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-22px) scale(1.03); }
        }
        .login-visual {
          background: radial-gradient(1200px circle at 20% 20%, #7b2cbf 0%, #5a189a 45%, #240046 100%);
          position: relative;
          overflow: hidden;
        }
        .login-visual::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(800px circle at 80% 20%, rgba(255,255,255,0.08), transparent 60%);
        }
        .bubble {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0.12));
          box-shadow:
            inset -10px -10px 22px rgba(0,0,0,0.25),
            inset 12px 12px 26px rgba(255,255,255,0.18),
            0 20px 45px rgba(0,0,0,0.25);
          backdrop-filter: blur(2px);
          animation: float 10s ease-in-out infinite;
        }
        .bubble::after {
          content: "";
          position: absolute;
          top: 18%;
          left: 20%;
          width: 28%;
          height: 28%;
          border-radius: 999px;
          background: rgba(255,255,255,0.45);
          filter: blur(1px);
        }
        .bubble::before {
          content: "";
          position: absolute;
          bottom: 18%;
          right: 22%;
          width: 16%;
          height: 16%;
          border-radius: 999px;
          background: rgba(255,255,255,0.25);
          filter: blur(1px);
        }
        .login-card {
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          backdrop-filter: blur(10px);
        }
        .login-panel {
          position: relative;
          overflow: hidden;
        }
        .login-panel .bubble {
          opacity: 0.6;
        }
        .btn-hero {
          background: linear-gradient(135deg, #7b2cbf 0%, #5a189a 45%, #3c096c 100%);
          border: 0;
          box-shadow: 0 12px 24px rgba(90, 24, 154, 0.35);
        }
        .btn-hero:hover {
          filter: brightness(1.05);
        }
        .form-control:focus, .form-check-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(123, 44, 191, 0.2);
          border-color: #7b2cbf;
        }
      `}</style>
      <div className="row vh-100 g-0">
        <div className="col-lg-8 d-none d-lg-flex align-items-center justify-content-center text-white login-visual">
          <div className="text-center px-4 position-relative" style={{ zIndex: 2, maxWidth: 560 }}>
            <div className="text-uppercase small mb-3 fw-semibold opacity-75">HRMS Platform</div>
            <h1 className="display-4 fw-bold mb-3">Bubble</h1>
            <p className="lead mb-4">A smarter, calmer workspace for people operations.</p>
            <div className="d-flex justify-content-center gap-3">
              <div className="px-3 py-2 rounded-pill border border-light border-opacity-25 small">Secure Access</div>
              <div className="px-3 py-2 rounded-pill border border-light border-opacity-25 small">Role Based</div>
              <div className="px-3 py-2 rounded-pill border border-light border-opacity-25 small">Always On</div>
            </div>
          </div>
          <div className="bubble" style={{ width: 260, height: 260, top: "8%", left: "6%" }} />
          <div className="bubble" style={{ width: 140, height: 140, bottom: "10%", left: "16%", animationDelay: "-2s" }} />
          <div className="bubble" style={{ width: 320, height: 320, top: "18%", right: "6%", animationDelay: "-4s" }} />
          <div className="bubble" style={{ width: 180, height: 180, bottom: "18%", right: "20%", animationDelay: "-6s" }} />
          <div className="bubble" style={{ width: 110, height: 110, top: "55%", left: "10%", animationDelay: "-3s" }} />
          <div className="bubble" style={{ width: 80, height: 80, top: "30%", left: "48%", animationDelay: "-5s" }} />
          <div className="bubble" style={{ width: 90, height: 90, bottom: "28%", left: "40%", animationDelay: "-7s" }} />
        </div>

        <div
          className="col-12 col-lg-4 d-flex align-items-center login-panel"
          style={{ background: "linear-gradient(180deg, #f7f0ff 0%, #efe3ff 100%)" }}
        >
          <div
            className="card border-0 shadow-lg login-card position-relative ms-lg-auto me-lg-3"
            style={{ zIndex: 2, width: "min(420px, 90%)" }}
          >
            <div className="card-body p-4">
              <div className="mb-4">
                <h2 className="fw-bold mb-1">Sign In</h2>
                <p className="text-muted mb-0">Welcome back! Please enter your details.</p>
              </div>

              {successMessage && (
                <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                  <FaCheckCircle /> <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                  <FaExclamationCircle /> <span>{errorMessage}</span>
                </div>
              )}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser />
                    </span>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="john.doe@bubble.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="password" className="form-label fw-semibold mb-0">
                      Password
                    </label>
                    <button type="button" className="btn btn-link p-0" onClick={handleForgotPassword}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>

                <button type="submit" className="btn btn-hero text-white w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue <FaArrowRight className="ms-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center my-4">
                <span className="text-muted small text-uppercase">Secure Login</span>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2"
                  onClick={handleGoogleLogin}
                >
                  <FaGoogle />
                  Sign in with Google
                </button>
                <button type="button" className="btn btn-outline-primary" onClick={handleLinkedInLogin}>
                  <FaLinkedin className="me-2" />
                  Sign in with LinkedIn
                </button>
              </div>
            </div>
          </div>
          <div className="bubble" style={{ width: 180, height: 180, top: "8%", right: "12%", animationDelay: "-3s" }} />
          <div className="bubble" style={{ width: 120, height: 120, bottom: "12%", right: "18%", animationDelay: "-5s" }} />
          <div className="bubble" style={{ width: 90, height: 90, top: "55%", right: "30%", animationDelay: "-7s" }} />
        </div>
      </div>
    </div>
  );
}
