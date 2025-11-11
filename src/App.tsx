import React from "react";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import Home from "./pages/Home";
import Configuration from "./pages/Configuration";
import ExpenseTracker from "./pages/ExpenseTracker";
import { ProfileMonthYearProvider } from "./context/ProfileMonthYearProvider";
import ProfileMonthYearSelector from "./components/ProfileMonthYearSelector";

const App: React.FC = () => {
  return (
     <ProfileMonthYearProvider>
      <div className="container-fluid">
        <ProfileMonthYearSelector />
          <Router>
            <div className="container">
              {/* Navigation bar */}
              <div className="d-flex justify-content-around my-4">
                <Link className="btn btn-primary" to="/">Home</Link>
                <Link className="btn btn-primary" to="/expenseTracker">Expense tracker</Link>
                <Link className="btn btn-primary" to="/configuration">Configuration</Link>
              </div>

              {/* Main content */}
              <Routes>
                <Route path="/" element={<Home />} />         {/* Default landing page */}
                <Route path="/expenseTracker" element={<ExpenseTracker />} />
                <Route path="/configuration" element={<Configuration />} />
                <Route path="*" element={<Home />} />      {/* default Fallback for undefined routes */}
              </Routes>
            </div>
          </Router>
      </div>
     </ProfileMonthYearProvider>

    
  );
};


export default App
