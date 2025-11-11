import React, { useEffect, useState } from "react";
import axios from "axios";
import BudgetTracker from "../components/BudgetTracker";
import SectionTracker from "../components/SectionTracker";
import InvestmentTracker from "../components/InvestmentTracker";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import type { Section } from "../types/Budget";
import InsuranceTracker from "../components/InsuranceTracker";
import SavingsTracker from "../components/SavingsTracker";

const API_BASE = "http://localhost:8080/mrFinMateService";

const Home: React.FC = () => {
  const { profileId, month, year } = useProfileMonthYear();
  const [sectionArr, setSectionArr] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  return (
    <div className="container mt-4">
      <h3 className="text-center text-primary fw-bold mb-4">Dashboard Overview</h3>

      {loading ? (
        <div className="text-center my-3">Loading dashboard...</div>
      ) : (
        <>
          <BudgetTracker />
          <SectionTracker sectionArr={sectionArr} /> {/* optional if you want reuse */}
          <InvestmentTracker sectionArr={sectionArr} /> {/* ✅ this now works */}
          <InsuranceTracker sectionArr={sectionArr} /> {/* ✅ this now works */}
          <SavingsTracker sectionArr={sectionArr} /> {/* ✅ this now works */}
        </>
      )}
    </div>
  );
};

export default Home;
