import React, { useEffect, useState } from "react";
import axios from "axios";
import BudgetTracker from "../components/BudgetTracker";
import SectionTracker from "../components/SectionTracker";
import InvestmentTracker from "../components/InvestmentTracker";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import type { Section } from "../types/Budget";
import InsuranceTracker from "../components/InsuranceTracker";
import SavingsTracker from "../components/SavingsTracker";
import WantsTracker from "../components/WantsTracker";

const API_BASE = "http://localhost:8080/mrFinMateService";

const Home: React.FC = () => {
  const { profileId, month, year } = useProfileMonthYear();
  const [sectionArr, setSectionArr] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("Budget Tracker");

  useEffect(() => {
    setActiveTab("Budget Tracker");
    setSectionArr([]); // clear old month/year data
    if (profileId && month && year) {
      setLoading(true);
      axios
        .get<Section[]>(`${API_BASE}/fetchBudgetSections`, {
          params: { profileId, month, year },
        })
        .then((res) => setSectionArr(res.data || []))
        .catch((err) => console.error("Failed to fetch sections", err))
        .finally(() => setLoading(false));
    }
  }, [profileId, month, year]);

    const renderTabContent = () => {
    switch (activeTab) {
      case "Budget Tracker":
        return <BudgetTracker />
      case "Section Tracker":
        return <SectionTracker sectionArr={sectionArr} />;
      case "Wants Tracker":
        return <WantsTracker sectionArr={sectionArr} />;
      case "Savings Tracker":
        return <SavingsTracker sectionArr={sectionArr} />;
      case "Investment Tracker":
        return <InvestmentTracker sectionArr={sectionArr} />;
      case "Insurance Tracker":
        return <InsuranceTracker sectionArr={sectionArr} />;
      default:
        return null;
    }
  };
  

  return (
    <div className="container mt-4">
      <h3 className="text-center text-primary fw-bold mb-4">Dashboard Overview</h3>

      {loading ? (
        <div className="text-center my-3">Loading dashboard...</div>
      ) : (
        <>
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            {["Budget Tracker", "Section Tracker", "Wants Tracker", "Savings Tracker", "Investment Tracker", "Insurance Tracker"].map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>

          {/* Render the content for the selected tab */}
          <div>{renderTabContent()}</div>
        </>
      )}
    </div>
  );
};

export default Home;
