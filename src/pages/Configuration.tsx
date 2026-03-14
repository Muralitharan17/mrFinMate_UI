import React, { useState, useCallback, useEffect } from "react";
import BudgetConfiguration from "../components/BudgetConfiguration";
import InvestmentConfiguration from "../components/InvestmentConfiguration";
import WantConfiguration from "../components/WantConfiguration";
import SavingConfiguration from "../components/SavingConfiguration";
import InsuranceConfiguration from "../components/InsuranceConfiguration";
import MasterConfiguration from "../components/MasterConfiguration";
import type { Section } from "../types/Budget";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import ProfileConfiguration from "../components/ProfileConfiguration";
import GoalConfiguration from "../components/GoalConfiguration";

const Configuration: React.FC = () => {
  const { profileId, month, year } = useProfileMonthYear();

  const [sectionArr, setSectionArr] = useState<Section[]>([]);

  // Callback for BudgetConfiguration to report section updates
  const handleSectionUpdate = useCallback((sections: Section[]) => {
    setSectionArr(sections);
  }, []);

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("Budget");

  useEffect(() => {
    // Whenever profile, month, or year changes — auto-switch to Budget Configuration
    setActiveTab("Budget");
    console.log("Switched to Budget Configuration after context change");
  }, [profileId, month, year]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Budget":
        return <BudgetConfiguration onSectionsChange={handleSectionUpdate} />;
      case "Wants":
        return <WantConfiguration sectionArr={sectionArr} />;
      case "Investment":
        return <InvestmentConfiguration sectionArr={sectionArr} />;
      case "Saving":
        return <SavingConfiguration sectionArr={sectionArr} />;
      case "Insurance":
        return <InsuranceConfiguration sectionArr={sectionArr} />;
      case "Goal":
        return <GoalConfiguration />;
      case "Master":
        return <MasterConfiguration />;
      case "Profile":
        return <ProfileConfiguration />;
      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Configuration</h1>

      {profileId && month && year && (
        <>
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            {["Budget", "Wants", "Saving", "Investment", "Insurance", "Master", "Goal", "Profile"].map((tab) => (
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

export default Configuration;
