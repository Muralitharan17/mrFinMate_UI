import { createContext } from "react";

export interface ProfileMonthYearContextType {
  profileId: number | null;
  month: string;
  year: string;
  setProfileId: (id: number | null) => void;
  setMonth: (month: string) => void;
  setYear: (year: string) => void;
}

export const ProfileMonthYearContext = createContext<ProfileMonthYearContextType | undefined>(undefined);
