import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ProfileMonthYearProvider } from "./context/ProfileMonthYearProvider";
import UserLogin from "./pages/UserLogin";
import HomeScreen from "./pages/HomeScreen";

// Protected route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("user");
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ProfileMonthYearProvider>
      <Router>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<UserLogin />} />

          {/* Protected HomeScreen Route */}
          <Route
            path="/homeScreen/*"
            element={
              <ProtectedRoute>
                <HomeScreen />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ProfileMonthYearProvider>
  );
};

export default App;
