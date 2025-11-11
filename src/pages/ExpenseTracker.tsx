import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";



interface Expense {
  id?: number;
  date: string;
  transactionType: string;
  sectionType: string;
  financeType: string;
  financeCategory: string;
  financeDetail: string;
  amount: number;
  balance?: number;
}

// utils/format.ts
const formatIndianCurrency = (amount: number) => {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const API_BASE = "http://localhost:8080/mrFinMateService";

const ExpenseTracker: React.FC = () => {

    const { profileId, month, year } = useProfileMonthYear();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);
  const [sectionType, setSectionType] = useState<string[]>([]);
  const [financeTypes, setFinanceTypes] = useState<string[]>([]);
  const [financeCategories, setFinanceCategories] = useState<string[]>([]);
  const [financeDetails, setFinanceDetails] = useState<string[]>([]);
  const [form, setForm] = useState<Expense>({
    date: "",
    transactionType: "",
    sectionType: "",
    financeType: "",
    financeCategory: "",
    financeDetail: "",
    amount: 0,
  });

  // Load expenses when profile, month, or year changes
  useEffect(() => {
    if (profileId && month && year) {
      loadExpenses();
    }
  }, [profileId, month, year]);

  // Load initial dropdown configuration
  useEffect(() => {
    if (profileId && month && year) {
    loadConfig("TRANSACTION_TYPES", setTransactionTypes);
    }
  }, [profileId, month, year]);

  const loadExpenses = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/expenses?profileId=${profileId}&month=${month}&year=${year}`
      );
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  };

  const loadConfig = async (key: string, setter: (data: string[]) => void) => {
    try {
      // Fetch configs for the selected profile
      console.log(`Loading config for key: ${key}, profileId: ${profileId}, month: ${month}, year: ${year}`);
      key = key.replace(/\s+/g, "-");
      const res = await axios.get(
        `${API_BASE}/value`, {
          params: { profileId, configName: key, month, year },
        }
      );
      console.log("API response for", key, ":", res.data);
      if (res.data) {
        const configValue = res.data;
        if (configValue) {
          // Split comma-separated values and trim spaces
          const values = configValue
            .split(",")
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0);
          setter(values);
          console.log(`Loaded config for key: ${key}`, values);
        } else {
          setter([]); // if not found, empty dropdown
        }
      }
    } catch (err) {
      console.error(`Failed to load config for key: ${key}`, err);
      setter([]);
    }
  };

  // Handle dropdown dependencies
  const handleDropdownChange = async (name: string, value: string) => {
    setForm({ ...form, [name]: value });

    if (name === "transactionType") {
      // Load Section Types for the selected transaction type
      await loadConfig(`SECTION_TYPES_${value.toUpperCase()}`, setSectionType);
      setFinanceTypes([]);
      setFinanceCategories([]);
      setFinanceDetails([]);
    } else if (name === "sectionType") {
      // Load Finance Types for the selected section type
      setFinanceTypes([]);
      await loadConfig(`FINANCE_TYPES_${value.toUpperCase()}`, setFinanceTypes);
      setFinanceCategories([]);
      setFinanceDetails([]);
    } else if (name === "financeType") {
      // Load Categories for the selected finance type
      await loadConfig(`CATEGORY_TYPES_${form.sectionType.toUpperCase()}_${value.toUpperCase()}`, setFinanceCategories);
      setFinanceDetails([]);
    } else if (name === "financeCategory") {
      // Load Details for the selected category
      await loadConfig(`DETAIL_TYPES_${form.sectionType.toUpperCase()}_${form.financeType.toUpperCase()}_${value.toUpperCase()}`, setFinanceDetails);
    }
  };

  const handleSaveOrUpdate = async () => {
    const confirmMsg = editingExpense
      ? "Do you want to update this entry?"
      : "Do you want to save this new expense?";
    if (!window.confirm(confirmMsg)) return;

    try {
      if (editingExpense) {
        await axios.put(`${API_BASE}/expenses/${editingExpense.id}`, form);
      } else {
        await axios.post(`${API_BASE}/expenses`, {
          ...form,
          profileId: profileId,
          month: month,
          year: year,
        });
      }

      resetForm();
      loadExpenses();
    } catch (err) {
      console.error("Failed to save/update expense:", err);
    }
  };

  const handleEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setForm(exp);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${API_BASE}/expenses/${id}`);
        loadExpenses();
      } catch (err) {
        console.error("Failed to delete expense:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingExpense(null);
    setForm({
      date: "",
      transactionType: "",
      sectionType: "",
      financeType: "",
      financeCategory: "",
      financeDetail: "",
      amount: 0,
    });
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3 fw-semibold">Expense Tracker</h4>

      {/* Input Form */}
      <div className="card p-3 shadow-sm mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-medium">Date</label>
            <input
              type="date"
              className="form-control"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-medium">Transaction Type</label>
            <select
              className="form-select"
              value={form.transactionType}
              onChange={(e) =>
                handleDropdownChange("transactionType", e.target.value)
              }
            >
              <option value="">Select</option>
              {transactionTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-medium">section Type</label>
            <select
              className="form-select"
              value={form.sectionType}
              onChange={(e) =>
                handleDropdownChange("sectionType", e.target.value)
              }
            >
              <option value="">Select</option>
              {sectionType.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-medium">Finance Type</label>
            <select
              className="form-select"
              value={form.financeType}
              onChange={(e) =>
                handleDropdownChange("financeType", e.target.value)
              }
            >
              <option value="">Select</option>
              {financeTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-medium">Category</label>
            <select
              className="form-select"
              value={form.financeCategory}
              onChange={(e) =>
                handleDropdownChange("financeCategory", e.target.value)
              }
            >
              <option value="">Select</option>
              {financeCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium">Detail</label>
            <select
              className="form-select"
              value={form.financeDetail}
              onChange={(e) =>
                handleDropdownChange("financeDetail", e.target.value)
              }
            >
              <option value="">Select</option>
              {financeDetails.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-medium">Amount</label>
            <input
              type="number"
              className="form-control"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="text-end mt-3">
          <button className="btn btn-primary px-4" onClick={handleSaveOrUpdate}>
            {editingExpense ? "Update" : "Save"}
          </button>
          {editingExpense && (
            <button
              className="btn btn-secondary ms-2"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Expense Table */}
      <div className="table-responsive shadow-sm">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "5%" }}>S.No</th>
              <th>Date</th>
              <th>Transaction Type</th>
              <th>Section Type</th>
              <th>Finance Type</th>
              <th>Category</th>
              <th>Detail</th>
              <th>Amount</th>
              <th>Balance</th>
              <th style={{ width: "10%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted py-3">
                  No records found
                </td>
              </tr>
            ) : (
              expenses.map((exp, idx) => (
                <tr key={exp.id}>
                  <td>{idx + 1}</td>
                  <td>{exp.date}</td>
                  <td>{exp.transactionType}</td>
                  <td>{exp.sectionType}</td>
                  <td>{exp.financeType}</td>
                  <td>{exp.financeCategory}</td>
                  <td>{exp.financeDetail}</td>
                  <td>{formatIndianCurrency(exp.amount)}</td>
                  <td>{formatIndianCurrency(exp.balance || 0)}</td>
                  <td>
                    <i
                      className="bi bi-pencil-square text-primary me-3"
                      role="button"
                      title="Edit"
                      onClick={() => handleEdit(exp)}
                    ></i>
                    <i
                      className="bi bi-trash text-danger"
                      role="button"
                      title="Delete"
                      onClick={() => handleDelete(exp.id!)}
                    ></i>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTracker;
