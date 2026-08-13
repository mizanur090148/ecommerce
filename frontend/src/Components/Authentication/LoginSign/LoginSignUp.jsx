import React, { useState, useEffect } from "react";
import "./LoginSignUp.css";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../../Services/authService";

const LoginSignUp = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tabButton1");
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [regErrors, setRegErrors] = useState({});
  const [regApiError, setRegApiError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState("");

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setLoginError("");
    setRegApiError("");
    setRegSuccess("");
    setRegErrors({});
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (loginError) setLoginError("");
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
    if (regErrors[e.target.name]) {
      setRegErrors({ ...regErrors, [e.target.name]: null });
    }
    if (regApiError) setRegApiError("");
  };

  const validateRegForm = () => {
    const errors = {};
    if (!regData.name.trim()) errors.name = "Full Name is required";
    if (!regData.email.trim()) errors.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(regData.email)) errors.email = "Valid email address is required";
    if (!regData.password) errors.password = "Password is required";
    else if (regData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!regData.password_confirmation) errors.password_confirmation = "Please confirm your password";
    else if (regData.password !== regData.password_confirmation) errors.password_confirmation = "Passwords do not match";

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginData.email || !loginData.password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await authService.login(loginData);
      setCurrentUser(res.user);
      navigate("/shop");
    } catch (err) {
      setLoginError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setRegApiError("");
    setRegSuccess("");

    if (!validateRegForm()) return;

    setRegLoading(true);
    try {
      const res = await authService.register(regData);
      setRegSuccess("Account registered successfully! Redirecting to shop...");
      setCurrentUser(res.user);
      setTimeout(() => {
        navigate("/shop");
      }, 1500);
    } catch (err) {
      if (err.errors && err.errors.email) {
        setRegApiError(err.errors.email[0]);
      } else {
        setRegApiError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <>
      <div className="loginSignUpSection">
        <div className="loginSignUpContainer">
          {currentUser ? (
            <div className="loginSignUpTabsContent" style={{ textAlign: "center", padding: "40px 0" }}>
              <h3 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>Welcome Back, {currentUser.name}! 👋</h3>
              <p style={{ color: "#666", marginBottom: "25px" }}>Logged in as: {currentUser.email}</p>
              <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                <Link to="/shop">
                  <button style={{ padding: "12px 25px", background: "#000", color: "#fff", border: "none", cursor: "pointer", borderRadius: "4px" }}>
                    Continue Shopping
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ padding: "12px 25px", background: "#e53e3e", color: "#fff", border: "none", cursor: "pointer", borderRadius: "4px" }}
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="loginSignUpTabs">
                <p
                  onClick={() => handleTab("tabButton1")}
                  className={activeTab === "tabButton1" ? "active" : ""}
                >
                  Login
                </p>
                <p
                  onClick={() => handleTab("tabButton2")}
                  className={activeTab === "tabButton2" ? "active" : ""}
                >
                  Register
                </p>
              </div>
              <div className="loginSignUpTabsContent">
                {/* Tab 1: Login */}
                {activeTab === "tabButton1" && (
                  <div className="loginSignUpTabsContentLogin">
                    <form onSubmit={handleLoginSubmit}>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email address *"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                      />
                      <input
                        type="password"
                        name="password"
                        placeholder="Password *"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                      <div className="loginSignUpForgetPass">
                        <label>
                          <input type="checkbox" className="brandRadio" />
                          <p>Remember me</p>
                        </label>
                        <p>
                          <Link to="/resetPassword">Lost password?</Link>
                        </p>
                      </div>

                      {loginError && (
                        <div style={{ color: "#e53e3e", fontSize: "0.85rem", padding: "5px 0" }}>
                          {loginError}
                        </div>
                      )}

                      <button disabled={loginLoading}>
                        {loginLoading ? "Logging in..." : "Log In"}
                      </button>
                    </form>
                    <div className="loginSignUpTabsContentLoginText">
                      <p>
                        No account yet?{" "}
                        <span onClick={() => handleTab("tabButton2")}>
                          Create Account
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Updated Register Form */}
                {activeTab === "tabButton2" && (
                  <div className="loginSignUpTabsContentRegister">
                    <form onSubmit={handleRegSubmit}>
                      <div>
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name *"
                          value={regData.name}
                          onChange={handleRegChange}
                          style={{ borderColor: regErrors.name ? "#e53e3e" : "#e4e4e4", width: "100%" }}
                        />
                        {regErrors.name && (
                          <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                            {regErrors.name}
                          </span>
                        )}
                      </div>

                      <div>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email address *"
                          value={regData.email}
                          onChange={handleRegChange}
                          style={{ borderColor: regErrors.email ? "#e53e3e" : "#e4e4e4", width: "100%" }}
                        />
                        {regErrors.email && (
                          <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                            {regErrors.email}
                          </span>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          name="phone"
                          placeholder="Phone Number (Optional)"
                          value={regData.phone}
                          onChange={handleRegChange}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div>
                        <input
                          type="password"
                          name="password"
                          placeholder="Password *"
                          value={regData.password}
                          onChange={handleRegChange}
                          style={{ borderColor: regErrors.password ? "#e53e3e" : "#e4e4e4", width: "100%" }}
                        />
                        {regErrors.password && (
                          <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                            {regErrors.password}
                          </span>
                        )}
                      </div>

                      <div>
                        <input
                          type="password"
                          name="password_confirmation"
                          placeholder="Confirm Password *"
                          value={regData.password_confirmation}
                          onChange={handleRegChange}
                          style={{ borderColor: regErrors.password_confirmation ? "#e53e3e" : "#e4e4e4", width: "100%" }}
                        />
                        {regErrors.password_confirmation && (
                          <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                            {regErrors.password_confirmation}
                          </span>
                        )}
                      </div>

                      {regApiError && (
                        <div style={{ color: "#e53e3e", fontSize: "0.85rem", padding: "5px 0" }}>
                          {regApiError}
                        </div>
                      )}

                      {regSuccess && (
                        <div style={{ color: "#07bc0c", fontSize: "0.85rem", padding: "5px 0", fontWeight: "bold" }}>
                          {regSuccess}
                        </div>
                      )}

                      <p>
                        Your personal data will be used to support your experience
                        throughout this website, to manage access to your account,
                        and for other purposes described in our{" "}
                        <Link
                          to="/terms"
                          style={{ textDecoration: "none", color: "#c32929" }}
                        >
                          privacy policy
                        </Link>
                        .
                      </p>
                      <button disabled={regLoading}>
                        {regLoading ? "Registering..." : "Register"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginSignUp;
