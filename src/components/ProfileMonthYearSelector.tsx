import React, { useState, useEffect } from "react";
import axios from "axios";

interface props {
  onSelectionChange: (selectedProfileId: number, selectedMonth: string, selectedYear: string) => void;
}

const API_BASE = "http://localhost:8080/mrFinMateService";

const yearOptions = ["2024", "2025", "2026"];
const monthOptions = [
    "January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

const ProfileMonthYearSelector: React.FC<props> = ({onSelectionChange}) => {

    const [profiles, setProfiles] = useState<{id:number,name:string}[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");

    // Auto-select current month and year
    useEffect(() => {
        const now = new Date();
        const currentMonth = monthOptions[now.getMonth()]; // month index -> name
        const currentYear = now.getFullYear().toString();
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
    }, []); // run once at mount

    // Fetch profiles from backend
    useEffect(() => {
        axios.get(`${API_BASE}/profiles`)
            .then(res => {
                setProfiles(res.data);
                if (res.data.length) {
                    setSelectedProfileId(res.data[0].id);
                }
            });
    }, []);

    useEffect(() => {
        if(selectedProfileId && selectedMonth && selectedYear){
            onSelectionChange(selectedProfileId, selectedMonth, selectedYear);
        }
    }, [selectedProfileId, selectedMonth, selectedYear, onSelectionChange]);

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap">

                {/* Profile dropdown (left side) */}
                <div className="d-flex align-items-center gap-2">
                    <label className="form-label mb-0 fw-bold">Profile:</label>
                    <select className="form-select" style={{ width: "180px" }} value={selectedProfileId ? selectedProfileId : ""} onChange={(e) => setSelectedProfileId(Number(e.target.value))}>
                        {profiles.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Month/Year dropdowns (right side) */}
                <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                    <label className="form-label mb-0 fw-bold">Month:</label>
                    <select className="form-select" style={{ width: "140px" }} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        <option value="">Select Month</option>
                        {monthOptions.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>

                    <label className="form-label mb-0 fw-bold">Year:</label>
                    <select className="form-select" style={{ width: "100px" }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="">Select Year</option>
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
};

export default ProfileMonthYearSelector;