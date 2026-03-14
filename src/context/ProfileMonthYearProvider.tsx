import React, { useState } from "react";
import { ProfileMonthYearContext } from "../typescript/ProfileMonthYearContext";

export const ProfileMonthYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [month, setMonth] = useState<string>(new Date().toLocaleString("default", { month: "long" }));
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));

  return (
    <ProfileMonthYearContext.Provider value={{ profileId, month, year, setProfileId, setMonth, setYear }}>
      {children}
    </ProfileMonthYearContext.Provider>
  );
};
