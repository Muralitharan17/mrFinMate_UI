import React, { useEffect, useState } from "react";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import axios from "axios";

interface Profile {
  id: number;
  name: string;
}

const API_BASE = "http://localhost:8080/mrFinMateService";

const ProfileMonthYearSelector: React.FC = () => {

    const { profileId, month, year, setProfileId, setMonth, setYear } = useProfileMonthYear();
    const [profiles, setProfiles] = useState<Profile[]>([]);

    // ✅ make them stateful (so we can override after fetching from backend)
  const [yearOptions, setYearOptions] = useState<string[]>(["2024", "2025", "2026"]);
  const [monthOptions, setMonthOptions] = useState<string[]>([
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ]);

    // Auto-select current month and year
    useEffect(() => {
        const now = new Date();
        console.log("Current Date:", now.getMonth(), now.getFullYear());
        const currentMonth = monthOptions[now.getMonth()]; // month index -> name
        const currentYear = now.getFullYear().toString();
        setMonth(currentMonth);
        setYear(currentYear);
    }, []); // run once at mount

    // Fetch profiles from backend
    useEffect(() => {
        axios.get(`${API_BASE}/profiles`)
            .then(res => {
                setProfiles(res.data);
                if (res.data.length) {
                    setProfileId(res.data[0].id);
                }
            });
    }, []);

    // ✅ Fetch MONTH_OPTIONS and YEAR_OPTIONS dynamically whenever profileId changes
  useEffect(() => {
    const fetchConfigValue = async (configName: string): Promise<string[] | null> => {
      try {
        const res = await axios.get(`${API_BASE}/value`, {
          params: { profileId, configName , month, year},
        });
        if (res.data) {
          // Expect comma-separated values: "January,February,March"
          return res.data.split(",").map((item: string) => item.trim());
        }
      } catch (error) { 
        console.error(`Failed to fetch ${configName}:`, error);
      }
      return null;
    };

    if (profileId) {
      // Fetch and update both options
      fetchConfigValue("MONTH_OPTIONS").then((months) => {
        if (months && months.length > 0) setMonthOptions(months);
      });
      fetchConfigValue("YEAR_OPTIONS").then((years) => {
        if (years && years.length > 0) setYearOptions(years);
      });
    }
  }, [profileId]); // ✅ re-fetch when profile changes

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap">

                {/* Profile dropdown (left side) */}
                <div className="d-flex align-items-center gap-2">
                    <label className="form-label mb-0 fw-bold">Profile:</label>
                    <select className="form-select" style={{ width: "180px" }} value={profileId ? profileId : ""} onChange={(e) => setProfileId(Number(e.target.value))}>
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
                    <select className="form-select" style={{ width: "140px" }} value={month} onChange={(e) => setMonth(e.target.value)}>
                        <option value="">Select Month</option>
                        {monthOptions.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>

                    <label className="form-label mb-0 fw-bold">Year:</label>
                    <select className="form-select" style={{ width: "100px" }} value={year} onChange={(e) => setYear(e.target.value)}>
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
    );
}

export default ProfileMonthYearSelector;