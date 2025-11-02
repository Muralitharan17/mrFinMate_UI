import React, { useState, useCallback } from 'react';
import ProfileMonthYearSelector from "../components/ProfileMonthYearSelector";
import BudgetConfiguration from "../components/BudgetConfiguration";

const Configuration: React.FC = () => {

    const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");

    const handleProfileMonthYearSelectionChange = useCallback(
        (profileId: number, month: string, year: string) => {
            setSelectedProfileId(profileId);
            setSelectedMonth(month);
            setSelectedYear(year);
        },
        [] // stable reference; no re-creation each render
    );

    return (
        <div className="container mt-4">
            <h1 className="text-center">Configuration</h1>

            {/* Reusable Profile/Month/Year Selector */}
            <ProfileMonthYearSelector onSelectionChange={handleProfileMonthYearSelectionChange} />

            {/* Budget configuration depends on selected profile/month/year */}
            {selectedProfileId && selectedMonth && selectedYear && <BudgetConfiguration selectedProfileId={selectedProfileId} selectedMonth={selectedMonth} selectedYear={selectedYear} />}

            
        </div>
    );
};

export default Configuration;