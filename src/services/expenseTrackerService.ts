import axios from "axios";

const API_BASE = "http://localhost:8080/mrFinMateService";

export const getSectionTypes = async (profileId: number | null, month: string, year: string, transactionType: string) => {
  const configName = `SECTION_TYPES_${transactionType}`;
  const res = await axios.get(`${API_BASE}/value`, {
    params: { profileId, configName, month, year }
  });
  return res.data ? res.data.split(",").map((v: string) => v.trim()) : [];
};

export const getFinanceTypes = async (profileId: number | null, month: string, year: string, sectionType: string) => {
  const configName = `FINANCE_TYPES_${sectionType}`;
  const res = await axios.get(`${API_BASE}/value`, {
    params: { profileId, configName, month, year }
  });
  return res.data ? res.data.split(",").map((v: string) => v.trim()) : [];
};

export const getCategoryTypes = async (profileId: number | null, month: string, year: string, sectionType: string, financeType: string) => {
  const configName = `CATEGORY_TYPES_${sectionType}_${financeType}`;
  const res = await axios.get(`${API_BASE}/value`, {
    params: { profileId, configName, month, year }
  });
  return res.data ? res.data.split(",").map((v: string) => v.trim()) : [];
};

export const getDetailTypes = async (profileId: number | null, month: string, year: string, sectionType: string, financeType: string, category: string) => {
  const configName = `DETAIL_TYPES_${sectionType}_${financeType}_${category}`;
  const res = await axios.get(`${API_BASE}/value`, {
    params: { profileId, configName, month, year }
  });
  return res.data ? res.data.split(",").map((v: string) => v.trim()) : [];
};
