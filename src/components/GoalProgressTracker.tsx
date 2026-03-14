import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";

interface GoalConfig {
  id: number;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  requiredAmount: number;
  remarks?: string;
}

const API_BASE = "http://localhost:8080/mrFinMateService";

const GoalProgressTracker: React.FC = () => {
  const { profileId, month, year } = useProfileMonthYear();
  const [goals, setGoals] = useState<GoalConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const getProgressColor = (pct: number) => {
    if (pct < 100) return "bg-warning";
    if (pct > 100) return "bg-danger";
    return "bg-success";
  };

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/goalConfig/${profileId}`)
      .then((res) => setGoals(res.data || []))
      .catch((err) => console.error("Failed to fetch goal tracker", err))
      .finally(() => setLoading(false));
  }, [profileId, month, year]);

  if (loading)
    return <div className="text-center my-3">Loading goal tracker...</div>;

  if (!goals.length)
    return <div className="text-muted text-center my-3">No goals found.</div>;

  return (
    <div className="card shadow-sm border-0 mb-4 rounded-3">
      <div className="card-header bg-info text-white fw-bold">🎯 Goal Progress Tracker</div>

      <div className="card-body bg-light">
        {goals.map((goal, index) => {
          const pct = goal.targetAmount
            ? (goal.currentAmount / goal.targetAmount) * 100
            : 0;
          const pctColor = getProgressColor(pct);

          return (
            <div
              key={goal.id}
              className="mb-3 p-3 bg-white rounded shadow-sm border-start border-4 border-info"
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold text-info mb-0">
                  {index + 1}. {goal.goalName}
                </h6>
                <small className="text-muted">{pct.toFixed(1)}% completed</small>
              </div>

              <div className="progress mb-2" style={{ height: "10px" }}>
                <div
                  className={`progress-bar ${pctColor}`}
                  role="progressbar"
                  style={{ width: `${Math.min(pct, 120)}%` }}
                />
              </div>

              <div className="row text-center small mb-2">
                <div className="col">
                  <span className="text-muted">Target</span>
                  <div className="fw-bold text-primary">₹{goal.targetAmount.toLocaleString("en-IN")}</div>
                </div>
                <div className="col">
                  <span className="text-muted">Current</span>
                  <div className="fw-bold text-success">₹{goal.currentAmount.toLocaleString("en-IN")}</div>
                </div>
                <div className="col">
                  <span className="text-muted">Remaining</span>
                  <div className="fw-bold text-danger">₹{goal.requiredAmount.toLocaleString("en-IN")}</div>
                </div>
              </div>

              {goal.remarks && (
                <div className="text-muted small fst-italic">Note: {goal.remarks}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalProgressTracker;
