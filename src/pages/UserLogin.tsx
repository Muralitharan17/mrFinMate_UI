import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/mrFinMateService";

const UserLogin: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({
    userName: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    phoneNo: "",
    emailId: "",
  });

  // Handle login input change
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  // Handle register input change
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
  };

  // Login handler
  const handleLogin = async () => {
    if (!loginForm.userName || !loginForm.password) {
      alert("Please enter username and password");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/user/login`, loginForm);
      if (res.data?.success) {
        alert("Login successful!");
        localStorage.setItem("user", JSON.stringify(res.data.user)); // store user info
        window.location.href = "/homeScreen/home"; // redirect to home screen
      } else {
        alert(res.data?.message || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Error during login");
    }
  };

  // Register handler
  const handleRegister = async () => {
    const { userName, password, confirmPassword, phoneNo, emailId } = registerForm;

    if (!userName || !password || !confirmPassword) {
      alert("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/user/register`, {
        userName,
        password,
        phoneNo,
        emailId,
      });
      if (res.data?.success) {
        alert("Registration successful!");
        setIsRegistering(false);
      } else {
        alert(res.data?.message || "Failed to register");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Error during registration");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h4 className="fw-semibold mb-4 text-center">
        {isRegistering ? "Register New User" : "User Login"}
      </h4>

      <div className="card p-4 shadow-sm">
        {!isRegistering ? (
          <>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="userName"
                className="form-control"
                value={loginForm.userName}
                onChange={handleLoginChange}
                placeholder="Enter username"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Enter password"
              />
            </div>

            <button className="btn btn-primary w-100" onClick={handleLogin}>
              Login
            </button>

            <div className="text-center mt-3">
              <small>
                Don't have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegistering(true);
                  }}
                >
                  Register here
                </a>
              </small>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label className="form-label">Username *</label>
              <input
                type="text"
                name="userName"
                className="form-control"
                value={registerForm.userName}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={registerForm.password}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phoneNo"
                className="form-control"
                value={registerForm.phoneNo}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email ID</label>
              <input
                type="email"
                name="emailId"
                className="form-control"
                value={registerForm.emailId}
                onChange={handleRegisterChange}
              />
            </div>

            <button className="btn btn-success w-100" onClick={handleRegister}>
              Submit
            </button>

            <div className="text-center mt-3">
              <small>
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegistering(false);
                  }}
                >
                  Back to Login
                </a>
              </small>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
