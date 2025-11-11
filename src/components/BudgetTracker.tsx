import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import type { BudgetConfig } from "../types/Budget";

const API_BASE = "http://localhost:8080/mrFinMateService";

const BudgetTracker: React.FC = () => {
  const { profileId, month, year } = useProfileMonthYear();
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig | null>(null);
  const [loading, setLoading] = useState(false);

  // Utility to decide progress bar color
  const getProgressColor = (percentage: number) => {
    if (percentage < 100) return "bg-warning"; // orange
    if (percentage > 100) return "bg-danger";  // red
    return "bg-success";                       // green
  };

  useEffect(() => {
    if (profileId && month && year) {
      setLoading(true);
      axios
        .get<BudgetConfig>(`${API_BASE}/fetchBudgetConfig`, {
          params: { profileId, month, year },
        })
        .then((res) => setBudgetConfig(res.data))
        .catch((err) => console.error("Failed to fetch budget summary", err))
        .finally(() => setLoading(false));
    }
  }, [profileId, month, year]);

  if (loading) return <div className="text-center my-3">Loading budget tracker...</div>;
  if (!budgetConfig) return <div className="text-muted text-center my-3">No budget data available.</div>;

  const { budgetSalary, spentSalary, balanceSalary } = budgetConfig;
  const spentPercentage = budgetSalary ? (spentSalary / budgetSalary) * 100 : 0;
  const balancePercentage = budgetSalary ? (balanceSalary / budgetSalary) * 100 : 0;

  return (
    <div className="card shadow-sm mb-4 border-0 rounded-3">
      <div className="card-body">
        <h5 className="card-title text-primary fw-bold mb-4">💰 Budget Tracker</h5>

        {/* Budget Salary */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-secondary">Budget Salary</span>
            <span className="fw-bold text-dark">₹{budgetSalary.toLocaleString()}</span>
          </div>
        </div>

        {/* Spent Salary */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-secondary">Spent Salary</span>
            <span className={`fw-bold ${spentPercentage > 100 ? "text-danger" : "text-warning"}`}>
              ₹{spentSalary.toLocaleString()}
            </span>
          </div>
          <div className="progress" style={{ height: "14px" }}>
            <div
              className={`progress-bar ${getProgressColor(spentPercentage)}`}
              role="progressbar"
              style={{ width: `${Math.min(spentPercentage, 150)}%`, transition: "width 0.6s ease" }}
            >
              {spentPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Balance Salary */}
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold text-secondary">Balance Salary</span>
            <span className="fw-bold text-success">₹{balanceSalary.toLocaleString()}</span>
          </div>
          <div className="progress" style={{ height: "14px" }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${Math.min(balancePercentage, 150)}%`, transition: "width 0.6s ease" }}
            >
              {balancePercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
