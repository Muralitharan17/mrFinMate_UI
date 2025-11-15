import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Configuration from "./Configuration";
import ExpenseTracker from "./ExpenseTracker";
import ProfileMonthYearSelector from "../components/ProfileMonthYearSelector";
import Dashboard from "./Dashboard";

const HomeScreen: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="container-fluid">
      <ProfileMonthYearSelector />

      <div className="container">
        {/* Navigation bar */}
        <div className="d-flex justify-content-around my-4 align-items-center">
          <Link className="btn btn-primary" to="/homeScreen/home">Home</Link>
          <Link className="btn btn-primary" to="/homeScreen/expenseTracker">Expense Tracker</Link>
          <Link className="btn btn-primary" to="/homeScreen/configuration">Configuration</Link>
          <Link className="btn btn-primary" to="/homeScreen/dashboard">Dashboard</Link>

          {/* Logout Button */}
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Main Content */}
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/expenseTracker" element={<ExpenseTracker />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
};

export default HomeScreen;
