import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import type { Section } from "../types/Budget";
import type { Type } from "../types/Finance";

interface SavingsTrackerProps {
  sectionArr: Section[];
}

const API_BASE = "http://localhost:8080/mrFinMateService";

const SavingsTracker: React.FC<SavingsTrackerProps> = ({ sectionArr }) => {
  const { profileId, month, year } = useProfileMonthYear();
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(false);
  const [sectionId, setSectionId] = useState<number | string | null>(null);

  // Expand/collapse states
  const [expandedAll, setExpandedAll] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<{
    [key: string | number]: boolean;
  }>({});
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string | number]: boolean;
  }>({});

  // Find "Savings" sectionId
  useEffect(() => {
    if (sectionArr && sectionArr.length > 0) {
      const savingsSection = sectionArr.find(
        (s) => s.name?.toLowerCase() === "savings"
      );
      setSectionId(savingsSection ? savingsSection.id : null);
    }
  }, [sectionArr]);

  // Fetch data from backend
  useEffect(() => {
    if (!profileId || !sectionId || !month || !year) return;
    setLoading(true);

    axios
      .get<Type[]>(`${API_BASE}/fetchFinanceTypeConfig`, {
        params: { sectionId },
      })
      .then((res) => setTypes(res.data || []))
      .catch((err) => console.error("Failed to fetch savings tracker", err))
      .finally(() => setLoading(false));
  }, [profileId, month, year, sectionId]);

  // Helper: progress color
  const getProgressColor = (pct: number) => {
    if (pct < 100) return "bg-warning"; // orange
    if (pct > 100) return "bg-danger"; // red
    return "bg-success"; // green
  };

  // Toggle expand/collapse
  const toggleAll = () => {
    const newState = !expandedAll;
    setExpandedAll(newState);

    const newExpandedTypes: { [key: string | number]: boolean } = {};
    const newExpandedCats: { [key: string | number]: boolean } = {};
    types.forEach((type) => {
      newExpandedTypes[type.id] = newState;
      type.categories?.forEach((cat) => {
        newExpandedCats[cat.id] = newState;
      });
    });

    setExpandedTypes(newExpandedTypes);
    setExpandedCategories(newExpandedCats);
  };

  const toggleType = (id: number | string) =>
    setExpandedTypes((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCategory = (id: number | string) =>
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!sectionId)
    return (
      <div className="text-center my-3 text-muted">
        No Savings section found in your Budget configuration.
      </div>
    );

  if (loading)
    return <div className="text-center my-3">Loading savings tracker...</div>;

  if (!types.length)
    return (
      <div className="text-muted text-center my-3">
        No savings data available.
      </div>
    );

  return (
    <div className="card shadow-sm border-0 mb-4 rounded-3">
      <div className="card-header bg-success text-white fw-bold d-flex justify-content-between align-items-center">
        💰 Savings Tracker
        {/* Expand/Collapse All */}
        <button className="btn btn-sm btn-outline-light" onClick={toggleAll}>
          {expandedAll ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="card-body bg-light">
        {types.map((type, typeIndex) => {
          const typePct = type.allottedAmount
            ? (type.spentAmount / type.allottedAmount) * 100
            : 0;
          const typeColor = getProgressColor(typePct);
          const typeExpanded = expandedTypes[type.id] ?? true;

          return (
            <div
              key={type.id}
              className="mb-3 p-3 bg-white rounded shadow-sm border-start border-4 border-primary"
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => toggleType(type.id)}
                  >
                    {typeExpanded ? "-" : "+"}
                  </button>
                  <h6 className="fw-bold text-primary mb-0">
                    {typeIndex + 1}. {type.name}
                  </h6>
                </div>
                <small className="text-muted">
                  {typePct.toFixed(1)}% spent
                </small>
              </div>

              <div className="progress mb-2" style={{ height: "12px" }}>
                <div
                  className={`progress-bar ${typeColor}`}
                  style={{ width: `${Math.min(typePct, 120)}%` }}
                />
              </div>

              {/* Summary */}
              <div className="row text-center small mb-2">
                <div className="col">
                  <span className="text-muted">Allotted</span>
                  <div className="fw-bold text-primary">
                    ₹{(type.allottedAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="col">
                  <span className="text-muted">Spent</span>
                  <div className="fw-bold text-danger">
                    ₹{(type.spentAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div className="col">
                  <span className="text-muted">Balance</span>
                  <div className="fw-bold text-success">
                    ₹{(type.balanceAmount || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Categories */}
              {typeExpanded &&
                type.categories?.map((cat, catIndex) => {
                  const catPct = cat.allottedAmount
                    ? (cat.spentAmount / cat.allottedAmount) * 100
                    : 0;
                  const catColor = getProgressColor(catPct);
                  const catExpanded = expandedCategories[cat.id] ?? true;

                  return (
                    <div
                      key={cat.id}
                      className="ms-4 mt-3 p-3 bg-light rounded border-start border-4 border-secondary"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => toggleCategory(cat.id)}
                          >
                            {catExpanded ? "-" : "+"}
                          </button>
                          <h6 className="fw-semibold text-secondary mb-0">
                            {typeIndex + 1}.{catIndex + 1}. {cat.name}
                          </h6>
                        </div>
                        <small className="text-muted">
                          {catPct.toFixed(1)}% spent
                        </small>
                      </div>

                      <div className="progress mb-2" style={{ height: "10px" }}>
                        <div
                          className={`progress-bar ${catColor}`}
                          style={{ width: `${Math.min(catPct, 120)}%` }}
                        />
                      </div>

                      <div className="row text-center small mb-2">
                        <div className="col">
                          <span className="text-muted">Allotted</span>
                          <div className="fw-bold text-primary">
                            ₹{(cat.allottedAmount || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="col">
                          <span className="text-muted">Spent</span>
                          <div className="fw-bold text-danger">
                            ₹{(cat.spentAmount || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="col">
                          <span className="text-muted">Balance</span>
                          <div className="fw-bold text-success">
                            ₹{(cat.balanceAmount || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      {catExpanded &&
                        cat.details?.map((fund, fundIndex) => {
                          const fundPct = fund.allottedAmount
                            ? (fund.spentAmount / fund.allottedAmount) * 100
                            : 0;
                          const fundColor = getProgressColor(fundPct);

                          return (
                            <div
                              key={fund.id}
                              className="ms-4 mt-2 p-2 bg-white rounded border-start border-4 border-info"
                            >
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-semibold text-dark">
                                  {typeIndex + 1}.{catIndex + 1}.{fundIndex + 1}
                                  . {fund.name}
                                </span>
                                <small className="text-muted">
                                  {fundPct.toFixed(1)}% spent
                                </small>
                              </div>
                              <div
                                className="progress mb-1"
                                style={{ height: "8px" }}
                              >
                                <div
                                  className={`progress-bar ${fundColor}`}
                                  style={{
                                    width: `${Math.min(fundPct, 120)}%`,
                                  }}
                                />
                              </div>

                              <div className="row text-center small">
                                <div className="col">
                                  <span className="text-muted">Allotted</span>
                                  <div className="fw-bold text-primary">
                                    ₹
                                    {(
                                      fund.allottedAmount || 0
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div className="col">
                                  <span className="text-muted">Spent</span>
                                  <div className="fw-bold text-danger">
                                    ₹{(fund.spentAmount || 0).toLocaleString()}
                                  </div>
                                </div>
                                <div className="col">
                                  <span className="text-muted">Balance</span>
                                  <div className="fw-bold text-success">
                                    ₹
                                    {(fund.balanceAmount || 0).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsTracker;
