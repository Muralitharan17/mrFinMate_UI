import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import type { Section } from "../types/Budget";
import type { Type, Category, Detail } from "../types/Finance";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";

interface SavingConfigurationProps {
  sectionArr: Section[];
}

const API_BASE = "http://localhost:8080/mrFinMateService";

const SavingConfiguration: React.FC<SavingConfigurationProps> = ({ sectionArr }) => {
  const { profileId, month, year } = useProfileMonthYear();

  const [savingArr, setSavingArr] = useState<Type[]>([]);
  const [totalSavingBudget, setTotalSavingBudget] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number | string>(0);

  // NEW: track expand/collapse states
  const [expandedAll, setExpandedAll] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<{ [key: string]: boolean }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  // Whenever sections change, update savings budget
  useEffect(() => {
    const savingSection = sectionArr.find(
      (s) => s.name?.toLowerCase() === "savings"
    );
    const newBudget = savingSection?.allocatedAmount || 0;
    console.log("Updated Saving Budget:", newBudget);
    setTotalSavingBudget(newBudget);
    setSectionId(savingSection?.id || 0);

    console.log("Saving Section:", savingSection);
    console.log("Saving Section ID:", savingSection?.id || 0);

	// Optionally recalc nested investment structure
    setSavingArr((prev) => recalcAll(prev));
  }, [sectionArr]);

  // Add Type
  const addSavingType = () => {
    const newId = uuidv4();
    setSavingArr([
      ...savingArr,
      {
        id: newId,
        sectionId: sectionId,
        name: "",
        percentage: 0,
        allottedAmount: 0,
        spentAmount: 0,
        balanceAmount: 0,
        categories: [],
      },
    ]);
    setExpandedTypes((prev) => ({ ...prev, [newId]: true }));
  };

  // Delete Type
  const deleteSavingType = (typeId: string | number) => {
    const updatedSavingArr = savingArr.filter((t) => t.id !== typeId);
    setSavingArr(recalcAll(updatedSavingArr));
    const updatedExpanded = { ...expandedTypes };
    delete updatedExpanded[typeId];
    setExpandedTypes(updatedExpanded);
  };

  // Recalculate all nested values
  const recalcAll = (data: Type[]) => {
    return data.map((type) => {
      const typeTotal = calcTotalPercentage(data);
      const isTypeInvalid = typeTotal > 100;

      const typeAmount = isTypeInvalid ? 0 : (totalSavingBudget * type.percentage) / 100;
      type.allottedAmount = typeAmount;

      const catTotal = calcTotalPercentage(type.categories);
      const isCatInvalid = catTotal > 100;

      type.categories = type.categories.map((cat) => {
        const catAmount = isCatInvalid ? 0 : (typeAmount * cat.percentage) / 100;
        cat.allottedAmount = catAmount;

        const fundTotal = calcTotalPercentage(cat.details);
        const isFundInvalid = fundTotal > 100;

        cat.details = cat.details.map((detail) => ({
          ...detail,
          allottedAmount: isFundInvalid ? 0 : (catAmount * detail.percentage) / 100,
        }));

        return { ...cat };
      });
      return { ...type };
    });
  };

  // Helper to calculate total %
  const calcTotalPercentage = <T extends { percentage: number }>(items: T[]) =>
    items.reduce((sum, i) => sum + (i.percentage || 0), 0);

  // Handlers
  const handleSavingTypeChanges = (
    typeId: string | number,
    field: keyof Type,
    value: string | number
  ) => {
    const updated = savingArr.map((t) =>
      t.id === typeId ? { ...t, [field]: value } : t
    );
    setSavingArr(recalcAll(updated));
  };

  const addCategory = (typeId: string | number) => {
    const newCatId = uuidv4();
    setSavingArr(
      savingArr.map((t) =>
        t.id === typeId
          ? {
              ...t,
              categories: [
                ...t.categories,
                { id: newCatId, name: "", percentage: 0, allottedAmount: 0, spentAmount: 0, balanceAmount: 0, details: [] },
              ],
            }
          : t
      )
    );
    setExpandedCategories((prev) => ({ ...prev, [newCatId]: true }));
  };

  const deleteCategory = (typeId: string | number, catId: string | number) => {
    const updatedSavingArr = savingArr.map((t) =>
      t.id === typeId
        ? { ...t, categories: t.categories.filter((cat) => cat.id !== catId) }
        : t
    );
    setSavingArr(recalcAll(updatedSavingArr));
  };

  const handleCategoryChanges = (
    typeId: string | number,
    catId: string | number,
    field: keyof Category,
    value: string | number
  ) => {
    const updatedSavingArr = savingArr.map((t) =>
      t.id === typeId
        ? {
            ...t,
            categories: t.categories.map((cat) =>
              cat.id === catId ? { ...cat, [field]: value } : cat
            ),
          }
        : t
    );
    setSavingArr(recalcAll(updatedSavingArr));
  };

  const addSavingDetail = (typeId: string | number, catId: string | number) => {
    setSavingArr(
      savingArr.map((t) =>
        t.id === typeId
          ? {
              ...t,
              categories: t.categories.map((cat) =>
                cat.id === catId
                  ? {
                      ...cat,
                      details: [
                        ...cat.details,
                        { id: uuidv4(), name: "", percentage: 0, allottedAmount: 0, spentAmount: 0, balanceAmount: 0 },
                      ],
                    }
                  : cat
              ),
            }
          : t
      )
    );
  };

  const handleFundChanges = (
    typeId: string | number,
    catId: string | number,
    fundId: string | number,
    field: keyof Detail,
    value: string | number
  ) => {
    const updatedSavingArr = savingArr.map((t) =>
      t.id === typeId
        ? {
            ...t,
            categories: t.categories.map((cat) =>
              cat.id === catId
                ? {
                    ...cat,
                    details: cat.details.map((fund) =>
                      fund.id === fundId ? { ...fund, [field]: value } : fund
                    ),
                  }
                : cat
            ),
          }
        : t
    );
    setSavingArr(recalcAll(updatedSavingArr));
  };

  const deleteFund = (
    typeId: string | number,
    catId: string | number,
    fundId: string | number
  ) => {
    const updatedSavingArr = savingArr.map((t) =>
      t.id === typeId
        ? {
            ...t,
            categories: t.categories.map((cat) =>
              cat.id === catId
                ? { ...cat, details: cat.details.filter((f) => f.id !== fundId) }
                : cat
            ),
          }
        : t
    );
    setSavingArr(recalcAll(updatedSavingArr));
  };

  // Fetch Savings config
  useEffect(() => {
    if (!profileId || !sectionId || sectionId == 0 || typeof sectionId === "string") {
      console.log("Skipping fetch - invalid sectionId or profileId", sectionId);
      setSavingArr([]);
      return;
    }

    axios
      .get(`${API_BASE}/fetchFinanceTypeConfig`, { params: { sectionId } })
      .then((res) => {
        if (res.data) {
          setSavingArr(res.data);
          console.log("Fetched Saving Config:", res.data);
        }
      });
  }, [profileId, month, year, sectionId]);

  // Save Savings Config
  const saveSavingConfig = () => {
    console.log("Saving Saving Config:", savingArr);
    console.log("sectionId:", sectionId);
    if (sectionId == null || typeof sectionId === "string" || sectionId == 0) {
      alert("Save the Budget Configuration with valid Saving section before saving Saving Configuration.");
      return;
    }

// Prepare payload by removing the temporary string IDs created via uuidv4
    const updatedSavings = savingArr.map((saving) => ({
      ...saving,
      id: typeof saving.id === "string" ? 0 : saving.id,
      categories: saving.categories.map((cat) => ({
        ...cat,
        id: typeof cat.id === "string" ? 0 : cat.id,
        details: cat.details.map((detail) => ({
          ...detail,
          id: typeof detail.id === "string" ? 0 : detail.id,
        })),
      })),
    }));

    const payload = {
      profileId,
      month,
      year,
      sectionId,
      financeTypes: updatedSavings,
    };

    axios
      .post(`${API_BASE}/saveOrUpdateFinanceTypeConfig`, payload)
      .then((res) => {
        alert("Saving configuration saved successfully!");
        if (res.data) setSavingArr(res.data);
      })
      .catch(() => alert("Error saving saving configuration."));
  };

  const toggleAll = () => {
    const newState = !expandedAll;
    setExpandedAll(newState);
    const newExpandedTypes: { [key: string]: boolean } = {};
    const newExpandedCats: { [key: string]: boolean } = {};
    savingArr.forEach((type) => {
      newExpandedTypes[type.id] = newState;
      type.categories.forEach((cat) => {
        newExpandedCats[cat.id] = newState;
      });
    });
    setExpandedTypes(newExpandedTypes);
    setExpandedCategories(newExpandedCats);
  };

  return (
    <div className="mt-5">
      <h3 className="text-center mb-4">Saving Configuration</h3>
      <p>
        <strong>Total Saving Budget:</strong>{" "}
        {totalSavingBudget.toLocaleString("en-IN")}
      </p>

      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-primary" onClick={addSavingType}>
          + Add Saving Type
        </button>
        <button className="btn btn-outline-secondary" onClick={toggleAll}>
          {expandedAll ? "-" : "+"}
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          Saving Configuration Details
        </div>
        <div className="card-body bg-light">
          {savingArr.map((type, typeIndex) => {
            const typeExpanded = expandedTypes[type.id] ?? true;
            return (
              <div key={type.id} className="mb-3 p-3 bg-white rounded shadow-sm">
                <div className="row align-items-center mb-2">
                  <div className="col-md-1 d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() =>
                        setExpandedTypes((prev) => ({
                          ...prev,
                          [type.id]: !typeExpanded,
                        }))
                      }
                    >
                      {typeExpanded ? "-" : "+"}
                    </button>
                    <span className="fw-bold">{typeIndex + 1}</span>
                  </div>

                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Saving Type (e.g. Short Term (0–1 year), Medium Term (1–5 years), Long Term (5+ years) )"
                      value={type.name}
                      onChange={(e) =>
                        handleSavingTypeChanges(type.id, "name", e.target.value.toUpperCase())
                      }
                    />
                  </div>

                  <div className="col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="%"
                      value={type.percentage}
                      onChange={(e) =>
                        handleSavingTypeChanges(type.id, "percentage", Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={`₹${type.allottedAmount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}`}
                    />
                  </div>

                  <div className="col-md-3 text-end">
                    <button
                      className="btn btn-outline-success me-2"
                      onClick={() => addCategory(type.id)}
                    >
                      + Add Category
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => deleteSavingType(type.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {typeExpanded &&
                  type.categories.map((cat, catIndex) => {
                    const catExpanded = expandedCategories[cat.id] ?? true;
                    return (
                      <div key={cat.id} className="ms-4 p-3 mb-3 bg-light rounded">
                        <div className="row align-items-center mb-2">
                          <div className="col-md-1 d-flex align-items-center">
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() =>
                                setExpandedCategories((prev) => ({
                                  ...prev,
                                  [cat.id]: !catExpanded,
                                }))
                              }
                            >
                              {catExpanded ? "-" : "+"}
                            </button>
                            <span className="fw-semibold">
                              {typeIndex + 1}.{catIndex + 1}
                            </span>
                          </div>

                          <div className="col-md-3">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Category Name (e.g. RD, FD, Emergency Fund, etc)"
                              value={cat.name}
                              onChange={(e) =>
                                handleCategoryChanges(
                                  type.id,
                                  cat.id,
                                  "name",
                                  e.target.value.toUpperCase()
                                )
                              }
                            />
                          </div>

                          <div className="col-md-2">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="%"
                              value={cat.percentage}
                              onChange={(e) =>
                                handleCategoryChanges(
                                  type.id,
                                  cat.id,
                                  "percentage",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>

                          <div className="col-md-3">
                            <input
                              type="text"
                              className="form-control"
                              readOnly
                              value={`₹${cat.allottedAmount.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}`}
                            />
                          </div>

                          <div className="col-md-3 text-end">
                            <button
                              className="btn btn-outline-primary me-2"
                              onClick={() => addSavingDetail(type.id, cat.id)}
                            >
                              + Add Fund
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => deleteCategory(type.id, cat.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {catExpanded &&
                          cat.details.map((fund, fundIndex) => (
                            <div
                              key={fund.id}
                              className="ms-5 row mb-2 p-2 align-items-center bg-white rounded"
                            >
                              <div className="col-md-1 fw-semibold">
                                {typeIndex + 1}.{catIndex + 1}.{fundIndex + 1}
                              </div>

                              <div className="col-md-3">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Fund Name"
                                  value={fund.name}
                                  onChange={(e) =>
                                    handleFundChanges(
                                      type.id,
                                      cat.id,
                                      fund.id,
                                      "name",
                                      e.target.value.toUpperCase()
                                    )
                                  }
                                />
                              </div>

                              <div className="col-md-2">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="%"
                                  value={fund.percentage}
                                  onChange={(e) =>
                                    handleFundChanges(
                                      type.id,
                                      cat.id,
                                      fund.id,
                                      "percentage",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </div>

                              <div className="col-md-3">
                                <input
                                  type="text"
                                  className="form-control"
                                  readOnly
                                  value={`₹${fund.allottedAmount.toLocaleString(
                                    "en-IN",
                                    { maximumFractionDigits: 0 }
                                  )}`}
                                />
                              </div>

                              <div className="col-md-3 text-end">
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    deleteFund(type.id, cat.id, fund.id)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  })}
              </div>
            );
          })}

          <div className="text-center mt-4">
            <button className="btn btn-success px-4" onClick={saveSavingConfig}>
              Save Saving Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingConfiguration;
