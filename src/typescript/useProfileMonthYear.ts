import { useContext } from "react";
import { ProfileMonthYearContext } from "./ProfileMonthYearContext";

export const useProfileMonthYear = () => {
  const context = useContext(ProfileMonthYearContext);
  if (!context) throw new Error("useProfileMonthYear must be used within ProfileMonthYearProvider");
  return context;
};
