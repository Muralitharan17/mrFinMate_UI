import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import type { Goal } from "../types/Goal";
import { Button } from "react-bootstrap";
import moment from "moment";
import { getSectionTypes, getFinanceTypes, getCategoryTypes, getDetailTypes } from "../services/expenseTrackerService.ts";


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
  remark?: string;
}

interface Filter {
  singleDate: string;
  fromDate: string;
  toDate: string;
  transactionTypes: string[];
  sectionTypes: string[];
  financeTypes: string[];
  categories: string[];
  details: string[];
  minAmount: string;
  maxAmount: string;
  remark: string;
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
    const monthStart = moment(`${year}-${month}-01`).format("YYYY-MM-DD");
    const monthEnd = moment(`${year}-${month}-01`).endOf("month").format("YYYY-MM-DD");

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
    remark: ""
  });

  // 🆕 GOAL LIST
  const [goalList, setGoalList] = useState<string[]>([]);


  const [showFilters, setShowFilters] = useState(false);

  // Dropdown master data
  const [filterSectionTypeOptions, setFilterSectionTypeOptions] = useState<string[]>([]);
  const [filterFinanceTypeOptions, setFilterFinanceTypeOptions] = useState<string[]>([]);
  const [filterCategoryTypeOptions, setFilterCategoryTypeOptions] = useState<string[]>([]);
  const [filterDetailTypeOptions, setFilterDetailTypeOptions] = useState<string[]>([]);
  
  // Filters
  const [singleDate, setSingleDate] = useState(moment().format("YYYY-MM-DD"));
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterTransactionType, setFilterTransactionType] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterFinanceType, setFilterFinanceType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDetail, setFilterDetail] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [filterRemark, setFilterRemark] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  // -------------------------------
  // Load initial data
  // -------------------------------
  useEffect(() => {

    checkAndLoadData();

    if (profileId && month && year) {
      loadConfig("TRANSACTION_TYPES", setTransactionTypes);
      loadGoals();

      //  loadExpenses();
    }
  }, [profileId,month,year]);

  const checkAndLoadData = () => {
    const today = new Date();
    const todayMonth = today.toLocaleString("en-US", { month: "long" }).toUpperCase();
    const todayYear = String(today.getFullYear());
    console.log("Month - ", month, year, todayMonth, todayYear);
    const isCurrentMonth = month === todayMonth && year === todayYear;
    console.log("Is Current Month:", isCurrentMonth);
    if (isCurrentMonth) {
      // First time page loads → load today's data
      clearFiltersAndLoadTodayData();
    } else {
      // User changed month/year → load entire month
      console.log("Loading full month data for selected month/year");
      loadFullMonthData();
    }
  }


  const flushStateUpdates = () => new Promise(resolve => setTimeout(resolve, 0));

  const loadFullMonthData = () => {
    console.log("Loading today's data with cleared filters");
    setSingleDate("");
    setFromDate(monthStart);
    setToDate(monthEnd);
    setFilterTransactionType("");
    setFilterSection("");
    setFilterFinanceType("");
    setFilterCategory("");
    setFilterDetail("");
    setAmountMin("");
    setAmountMax("");
    setFilterRemark("");

    flushStateUpdates(); // wait for state updates to apply
    applyFilters();      // now applyFilters receives correct values
  };

  useEffect(() => {
    applyFilters();
  }, [fromDate, toDate]);

  // const loadExpenses = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${API_BASE}/expenses?profileId=${profileId}&month=${month}&year=${year}`
  //     );
  //     setExpenses(res.data);
  //   } catch (err) {
  //     console.error("Failed to load expenses:", err);
  //   }
  // };

  const clearFiltersAndLoadTodayData = () => {
    console.log("Loading today's data with cleared filters");

    setSingleDate(moment().format("YYYY-MM-DD"));
    setFromDate("");
    setToDate("");
    setFilterTransactionType("");
    setFilterSection("");
    setFilterFinanceType("");
    setFilterCategory("");
    setFilterDetail("");
    setAmountMin("");
    setAmountMax("");
    setFilterRemark("");

    flushStateUpdates(); // wait for state updates to apply
    applyFilters();      // now applyFilters receives correct values
  };

  useEffect(() => {
    loadDropdownData();
  }, [filterTransactionType, filterSection, filterFinanceType, filterCategory]);

  const loadDropdownData = async () => {
    const sec = await getSectionTypes(profileId, month, year, filterTransactionType);
    setFilterSectionTypeOptions(sec);
    setFilterSectionTypeOptions((prev) => [...prev, "GOALS"]);

    if(filterSection === "GOALS") {
      setFilterFinanceTypeOptions(goalList);
      setFilterCategoryTypeOptions(goalList);
      setFilterDetailTypeOptions(goalList);
    } else {
      const fin = await getFinanceTypes(profileId, month, year, filterSection);
      const cat = await getCategoryTypes(profileId, month, year, filterSection, filterFinanceType);
      const det = await getDetailTypes(profileId, month, year, filterSection, filterFinanceType, filterCategory);
      
      setFilterFinanceTypeOptions(fin);
      setFilterCategoryTypeOptions(cat);
      setFilterDetailTypeOptions(det);
    }
    
  };

  const applyFilters = async () => {
    try {

      const filterObj: Filter = {
      singleDate,
      fromDate,
      toDate,
      transactionTypes: filterTransactionType ? [filterTransactionType] : [],
      sectionTypes: filterSection ? [filterSection] : [],
      financeTypes: filterFinanceType ? [filterFinanceType] : [],
      categories: filterCategory ? [filterCategory] : [],
      details: filterDetail ? [filterDetail] : [],
      minAmount: amountMin,
      maxAmount: amountMax,
      remark: filterRemark
    }

      const res = await axios.post(`${API_BASE}/expenses/filter`, {
        profileId,
        month,
        year,
        filter: filterObj
      });
      setExpenses(res.data);
      setCurrentPage(1); // Reset to first page after filtering
    } catch (err) {
      console.error("Filter failed", err);
    }
  };




  // 🆕 GET GOALS FROM BACKEND
  const loadGoals = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/goalConfig/${profileId}`
      );

      if (res.data && res.data.length > 0) {
        const names = res.data.map((g: Goal) => g.goalName);
        setGoalList(names);
      } else {
        setGoalList([]);
      }
    } catch (err) {
      console.error("Failed to load goals:", err);
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

      // 🆕 Add GOALS option if DEBIT
      if (value.toUpperCase() === "DEBIT") {
        setSectionType((prev) => [...prev, "GOALS"]);
      }

      setFinanceTypes([]);
      setFinanceCategories([]);
      setFinanceDetails([]);
    } else if (name === "sectionType") {

      // If user selected GOALS → all dropdowns = goal names
      if (value === "GOALS") {
        setFinanceTypes(goalList);
        setFinanceCategories(goalList);
        setFinanceDetails(goalList);
        return;
      }

      // Load Finance Types for the selected section type
      setFinanceTypes([]);
      await loadConfig(`FINANCE_TYPES_${value.toUpperCase()}`, setFinanceTypes);
      setFinanceCategories([]);
      setFinanceDetails([]);
    } else if (name === "financeType") {
      // If GOALS selected
      if (form.sectionType === "GOALS") {
        setFinanceCategories(goalList);
        return;
      }

      // Load Categories for the selected finance type
      await loadConfig(`CATEGORY_TYPES_${form.sectionType.toUpperCase()}_${value.toUpperCase()}`, setFinanceCategories);
      setFinanceDetails([]);
    } else if (name === "financeCategory") {
      // If GOALS selected
      if (form.sectionType === "GOALS") {
        setFinanceDetails(goalList);
        return;
      }

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
      
        await axios.post(`${API_BASE}/expenses`, {
          ...form,
          profileId: profileId,
          month: month,
          year: year,
        });
      

      resetForm();    
      checkAndLoadData();
    //  loadExpenses();
    } catch (err) {
      console.error("Failed to save/update expense:", err);
    }
  };

  const handleEdit = async (exp: Expense) => {
    setEditingExpense(exp);
    setForm(exp);

    // 1. Load section types for transactionType
  await loadConfig(`SECTION_TYPES_${exp.transactionType.toUpperCase()}`, setSectionType);

  // If DEBIT → add GOALS
  if (exp.transactionType === "DEBIT") {
    setSectionType(prev => [...prev, "GOALS"]);
  }

  // 2. Load finance types
  if (exp.sectionType === "GOALS") {
    setFinanceTypes(goalList);
    setFinanceCategories(goalList);
    setFinanceDetails(goalList);
    return; // nothing else to load
  }

  await loadConfig(`FINANCE_TYPES_${exp.sectionType.toUpperCase()}`, setFinanceTypes);

  // 3. Load categories
  await loadConfig(
    `CATEGORY_TYPES_${exp.sectionType.toUpperCase()}_${exp.financeType.toUpperCase()}`,
    setFinanceCategories
  );

  // 4. Load details
  await loadConfig(
    `DETAIL_TYPES_${exp.sectionType.toUpperCase()}_${exp.financeType.toUpperCase()}_${exp.financeCategory.toUpperCase()}`,
    setFinanceDetails
  );
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${API_BASE}/expenses/${id}`);
        clearFiltersAndLoadTodayData();
       // loadExpenses();
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
      remark: ""
    });
  };


  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
              onChange={(e) => {
                const selected = e.target.value;
                // prevent invalid dates
                if (selected < monthStart || selected > monthEnd) return;
                setForm({ ...form, date: selected })}
              }
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

          <div className="row g-3 align-items-end mt-2">
            <div className="col-md-12">
              <label className="form-label fw-medium">Remark</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.remark || ""}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                placeholder="Enter remark (optional)"
              />
            </div>
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

      {/* Filter Toggle Button */}
      <div className="d-flex justify-content-end mb-2">
        <Button
          variant="primary"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5 className="fw-bold mb-3">Advanced Filters</h5>
          <div className="row g-3">
            {/* Single Date */}
            <div className="col-md-3">
              <label className="form-label">Specific Date</label>
              <input
                type="date"
                value={singleDate}
                className="form-control"
                onChange={(e) => setSingleDate(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div className="col-md-3">
              <label className="form-label">From Date</label>
              <input
                type="date"
                value={fromDate}
                className="form-control"
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">To Date</label>
              <input
                type="date"
                value={toDate}
                className="form-control"
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Transaction Type */}
            <div className="col-md-3">
              <label className="form-label">Transaction Type</label>
              <select
                className="form-select"
                value={filterTransactionType}
                onChange={(e) => setFilterTransactionType(e.target.value)}
              >
                <option value="">Select</option>
                {transactionTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              </select>
            </div>

            {/* Section Type */}
            <div className="col-md-3">
              <label className="form-label">Section Type</label>
              <select
                className="form-select"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="">Select</option>
                {filterSectionTypeOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              </select>
            </div>

            {/* Finance Type */}
            <div className="col-md-3">
              <label className="form-label">Finance Type</label>
              <select
                className="form-select"
                value={filterFinanceType}
                onChange={(e) => setFilterFinanceType(e.target.value)}
              >
                <option value="">Select</option>
                {filterFinanceTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Select</option>
                {filterCategoryTypeOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Detail */}
            <div className="col-md-3">
              <label className="form-label">Detail</label>
              <select
                className="form-select"
                value={filterDetail}
                onChange={(e) => setFilterDetail(e.target.value)}
              >
                <option value="">Select</option>
                {filterDetailTypeOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Range */}
            <div className="col-md-3">
              <label className="form-label">Min Amount</label>
              <input
                type="number"
                value={amountMin}
                className="form-control"
                onChange={(e) => setAmountMin(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Max Amount</label>
              <input
                type="number"
                value={amountMax}
                className="form-control"
                onChange={(e) => setAmountMax(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Remark Contains</label>
              <input
                type="text"
                className="form-control"
                value={filterRemark}
                onChange={(e) => setFilterRemark(e.target.value)}
                placeholder="Search text in remarks"
              />
            </div>

          </div>

          {/* Filter Buttons */}
          <div className="mt-3 d-flex gap-2">
            <Button variant="success" onClick={applyFilters}>Apply Filters</Button>
            <Button variant="secondary" onClick={clearFiltersAndLoadTodayData}>Clear</Button>
          </div>
        </div>
      )}

      {singleDate && <strong><p className="text-center"> Displaying Records for Today : "{singleDate}"</p></strong>}
      {fromDate && toDate && <strong><p className="text-center"> Displaying Records for the period from "{fromDate}" to "{toDate}"</p></strong>}

      {/* Expense Table pagination */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <label className="me-2">Rows per page:</label>
          <select
            className="form-select d-inline-block"
            style={{ width: "80px" }}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // reset page
            }}
          >
            {[5, 10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="text-muted">
          Showing {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, expenses.length)} of {expenses.length}
        </div>
      </div>

      {/* Expense Table */}
      
      <div className="table-responsive shadow-sm">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>S.No</th>
              <th style={{ width: "10%" }}>Date</th>
              <th>Transaction Type</th>
              <th>Section Type</th>
              <th>Finance Type</th>
              <th>Category</th>
              <th>Detail</th>
              <th>Amount</th>
              <th>Balance</th>
              <th style={{ width: "10%" }}>Action</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted py-3">
                  No records found for Today
                </td>
              </tr>
            ) : (
              currentExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.id}</td>
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
                  <td>{exp.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {expenses.length > 0 && (
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">

              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                  Prev
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <li
                  key={num}
                  className={`page-item ${currentPage === num ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => goToPage(num)}>
                    {num}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                  Next
                </button>
              </li>

            </ul>
          </nav>
        )}

      </div>
    </div>
  );
};

export default ExpenseTracker;
