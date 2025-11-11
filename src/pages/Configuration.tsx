import React, { useState, useCallback } from "react";
import BudgetConfiguration from "../components/BudgetConfiguration";
import InvestmentConfiguration from "../components/InvestmentConfiguration";
import SavingConfiguration from "../components/SavingConfiguration";
import InsuranceConfiguration from "../components/InsuranceConfiguration";
import MasterConfiguration from "../components/MasterConfiguration";
import type { Section } from "../types/Budget";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";

const Configuration: React.FC = () => {
  const { profileId, month, year } = useProfileMonthYear();

  const [sectionArr, setSectionArr] = useState<Section[]>([]);

  // Callback for BudgetConfiguration to report section updates
  const handleSectionUpdate = useCallback((sections: Section[]) => {
    setSectionArr(sections);
  }, []);

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("Budget");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Budget":
        return <BudgetConfiguration onSectionsChange={handleSectionUpdate} />;
      case "Investment":
        return <InvestmentConfiguration sectionArr={sectionArr} />;
      case "Saving":
        return <SavingConfiguration sectionArr={sectionArr} />;
      case "Insurance":
        return <InsuranceConfiguration sectionArr={sectionArr} />;
      case "Master":
        return <MasterConfiguration />;
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
            {["Budget", "Investment", "Saving", "Insurance", "Master"].map((tab) => (
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
