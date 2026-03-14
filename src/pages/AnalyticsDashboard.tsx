import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";

const API_BASE = "http://localhost:8080/mrFinMateService";
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#a4de6c",
  "#d0ed57",
  "#8dd1e1",
  "#ffb6c1",
  "#9370db",
  "#20b2aa",
  "#cd853f",
  "#ffd700",
  "#ff69b4",
  "#40e0d0",
  "#c71585",
  "#6a5acd",
];

interface Expense {
  id: number;
  transactionType: string;
  sectionType: string;
  financeType: string;
  financeCategory: string;
  financeDetail: string;
  amount: number;
}

type Level = "TRANSACTION" | "SECTION" | "FINANCE_TYPE" | "CATEGORY" | "DETAIL";

const AnalyticsDashboard: React.FC = () => {
  const { profileId, month, year } = useProfileMonthYear();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
  const [level, setLevel] = useState<Level>("TRANSACTION");

  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedFinanceType, setSelectedFinanceType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch expenses on profile/month/year change
  useEffect(() => {
    if (profileId && month && year) fetchExpenses();
  }, [profileId, month, year]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Expense[]>(
        `${API_BASE}/expenses?profileId=${profileId}&month=${month}&year=${year}&onlyExpenses=true`
      );
      setExpenses(res.data);
      buildTransactionChart(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  /** -------------------- LEVEL BUILDERS -------------------- */

  const buildTransactionChart = (data: Expense[]) => {
    const grouped = groupData(data, "transactionType");
    setChartData(grouped);
    setLevel("TRANSACTION");
    clearSelections();
  };

  const buildSectionChart = (transactionType: string) => {
    const filtered = expenses.filter((e) => e.transactionType === transactionType);
    const grouped = groupData(filtered, "sectionType");
    setChartData(grouped);
    setLevel("SECTION");
    setSelectedTransaction(transactionType);
    setSelectedSection(null);
    setSelectedFinanceType(null);
    setSelectedCategory(null);
  };

  const buildFinanceTypeChart = (sectionType: string) => {
    const filtered = expenses.filter(
      (e) => e.transactionType === selectedTransaction && e.sectionType === sectionType
    );
    const grouped = groupData(filtered, "financeType");
    setChartData(grouped);
    setLevel("FINANCE_TYPE");
    setSelectedSection(sectionType);
    setSelectedFinanceType(null);
    setSelectedCategory(null);
  };

  const buildCategoryChart = (financeType: string) => {
    const filtered = expenses.filter(
      (e) =>
        e.transactionType === selectedTransaction &&
        e.sectionType === selectedSection &&
        e.financeType === financeType
    );
    const grouped = groupData(filtered, "financeCategory");
    setChartData(grouped);
    setLevel("CATEGORY");
    setSelectedFinanceType(financeType);
    setSelectedCategory(null);
  };

  const buildDetailChart = (category: string) => {
    const filtered = expenses.filter(
      (e) =>
        e.transactionType === selectedTransaction &&
        e.sectionType === selectedSection &&
        e.financeType === selectedFinanceType &&
        e.financeCategory === category
    );
    const grouped = groupData(filtered, "financeDetail");
    setChartData(grouped);
    setLevel("DETAIL");
    setSelectedCategory(category);
  };

  /** -------------------- HELPERS -------------------- */

  const groupData = (data: Expense[], key: keyof Expense) => {
    const grouped = data.reduce<Record<string, number>>((acc, curr) => {
      const field = curr[key];
      acc[field] = (acc[field] || 0) + curr.amount;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // sort descending
  };

  const clearSelections = () => {
    setSelectedTransaction(null);
    setSelectedSection(null);
    setSelectedFinanceType(null);
    setSelectedCategory(null);
  };

  /** -------------------- HANDLERS -------------------- */

  const handleSliceClick = (data: { name: string }) => {
    if (level === "TRANSACTION") buildSectionChart(data.name);
    else if (level === "SECTION") buildFinanceTypeChart(data.name);
    else if (level === "FINANCE_TYPE") buildCategoryChart(data.name);
    else if (level === "CATEGORY") buildDetailChart(data.name);
  };

  const handleBackClick = () => {
    if (level === "DETAIL" && selectedFinanceType) {
      setSelectedCategory(null);
      buildCategoryChart(selectedFinanceType);
    } else if (level === "CATEGORY" && selectedSection) {
      setSelectedFinanceType(null);
      setSelectedCategory(null);
      buildFinanceTypeChart(selectedSection);
    } else if (level === "FINANCE_TYPE" && selectedTransaction) {
      setSelectedSection(null);
      setSelectedFinanceType(null);
      setSelectedCategory(null);
      buildSectionChart(selectedTransaction);
    } else if (level === "SECTION") {
      clearSelections();
      buildTransactionChart(expenses);
    }
  };

  const getTitle = () => {
    const parts = [selectedTransaction, selectedSection, selectedFinanceType, selectedCategory].filter(Boolean);
    if (parts.length === 0) return "Expense Overview by Transaction Type";
    return parts.join(" → ");
  };

  const totalAmount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  /** -------------------- CUSTOM LEGEND -------------------- */

  const CustomLegend = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
        {chartData.map((entry, index) => {
          const percent = ((entry.value / totalAmount) * 100).toFixed(1);
          return (
            <div
              key={`legend-${entry.name}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  backgroundColor: COLORS[index % COLORS.length],
                  borderRadius: 2,
                }}
              ></span>
              <span>
                {entry.name} — {percent}% — ₹{entry.value.toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  /** -------------------- UI -------------------- */

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4 fw-semibold">{getTitle()}</h4>

      {loading ? (
        <p className="text-center text-muted">Loading data...</p>
      ) : (
        <div className="card shadow-sm p-4">
          {level !== "TRANSACTION" && (
            <button className="btn btn-sm btn-outline-primary mb-3" onClick={handleBackClick}>
              ← Back
            </button>
          )}

          {chartData.length > 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {/* Chart */}
              <div style={{ flex: "1 1 65%", minWidth: "300px", height: 420 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${value.toLocaleString("en-IN")}`}
                      onClick={handleSliceClick}
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          cursor="pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{ flex: "1 1 30%", minWidth: "200px", paddingLeft: "20px" }}>
                <h6 className="fw-semibold mb-2 text-center">Legend</h6>
                <CustomLegend />
              </div>
            </div>
          ) : (
            <p className="text-center text-muted mb-0">No expense data available.</p>
          )}

          {/* Total Summary */}
          {chartData.length > 0 && (
            <div className="text-center mt-4 fw-semibold fs-6">
              Total Amount: ₹{totalAmount.toLocaleString("en-IN")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
