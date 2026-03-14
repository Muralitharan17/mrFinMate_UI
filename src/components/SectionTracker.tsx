import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import type { Section } from "../types/Budget";

const API_BASE = "http://localhost:8080/mrFinMateService";

interface SectionTrackerProps {
  sectionArr?: Section[]; // ✅ optional prop (can be reused from Home)
}

const SectionTracker: React.FC<SectionTrackerProps> = ({ sectionArr }) => {
  const { profileId, month, year } = useProfileMonthYear();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  // Utility for progress bar color logic
  const getProgressColor = (percentage: number) => {
    if (percentage < 100) return "bg-warning"; // 🟧 Orange
    if (percentage > 100) return "bg-danger";  // 🟥 Red
    return "bg-success";                       // 🟩 Green
  };

  useEffect(() => {

    if (sectionArr && sectionArr.length > 0) {
      setSections(sectionArr);
      return; // skip API fetch
    }

    if (profileId && month && year) {
      setLoading(true);
      axios
        .get<Section[]>(`${API_BASE}/fetchBudgetSections`, {
          params: { profileId, month, year },
        })
        .then((res) => setSections(res.data))
        .catch((err) => console.error("Failed to fetch section data", err))
        .finally(() => setLoading(false));
    }
  }, [profileId, month, year, sectionArr]);

  if (loading) return <div className="text-center my-3">Loading section trackers...</div>;
  if (!sections.length) return <div className="text-muted text-center my-3">No section data available.</div>;

  return (
    <div className="card shadow-sm border-0 mb-4 rounded-3">
      <div className="card-body">
        <h5 className="card-title text-success fw-bold mb-3">📊 Section Trackers</h5>

        {sections.map((section) => {
          const spentAmount = section.spentAmount || 0;
          const allocatedAmount = section.allocatedAmount || 0;
          const balanceAmount = section.balanceAmount || 0;

          const spentPct = allocatedAmount ? (spentAmount / allocatedAmount) * 100 : 0;
          const colorClass = getProgressColor(spentPct);

          return (
            <div key={section.id} className="mb-4 p-3 bg-light rounded-3 shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold text-secondary mb-0">{section.name}</h6>
                <small
                  className={`fw-semibold ${
                    spentPct < 100
                      ? "text-warning"
                      : spentPct > 100
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {spentPct.toFixed(1)}% spent
                </small>
              </div>

              <div className="progress mb-3" style={{ height: "14px" }}>
                <div
                  className={`progress-bar ${colorClass}`}
                  role="progressbar"
                  style={{
                    width: `${Math.min(spentPct, 150)}%`,
                    transition: "width 0.6s ease",
                  }}
                ></div>
              </div>

              <div className="row text-center">
                <div className="col">
                  <span className="text-muted small">Allotted</span>
                  <div className="fw-bold text-primary">
                    ₹{(allocatedAmount || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="col">
                  <span className="text-muted small">Spent</span>
                  <div
                    className={`fw-bold ${
                      spentPct > 100 ? "text-danger" : "text-warning"
                    }`}
                  >
                   ₹{(spentAmount || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="col">
                  <span className="text-muted small">Balance</span>
                  <div className="fw-bold text-success">
                    ₹{(balanceAmount || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionTracker;
