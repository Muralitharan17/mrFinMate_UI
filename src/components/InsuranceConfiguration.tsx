import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import type { Section } from "../types/Budget";
import type { Type, Category, Detail } from "../types/Finance";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";

interface InsuranceConfigurationProps {
  sectionArr: Section[];
}

const API_BASE = "http://localhost:8080/mrFinMateService";

const InsuranceConfiguration: React.FC<InsuranceConfigurationProps> = ({ sectionArr }) => {
  const { profileId, month, year } = useProfileMonthYear();

  const [insuranceArr, setInsuranceArr] = useState<Type[]>([]);
  const [totalInsuranceBudget, setTotalInsuranceBudget] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number | string>(0);

  const [expandedAll, setExpandedAll] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<{ [key: string]: boolean }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  // Set total insurance budget based on section
  useEffect(() => {
    const insuranceSection = sectionArr.find(
      (s) => s.name?.toLowerCase() === "insurance"
    );
    const newBudget = insuranceSection?.allocatedAmount || 0;
    setTotalInsuranceBudget(newBudget);
    setSectionId(insuranceSection?.id || 0);

    console.log("Insurance Section:", insuranceSection);
    setInsuranceArr((prev) => recalcAll(prev));
  }, [sectionArr]);



  // Add new Insurance Type
  const addInsuranceType = () => {
    const newId = uuidv4();
    setInsuranceArr([
      ...insuranceArr,
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

  // Delete Insurance Type
  const deleteInsuranceType = (typeId: string | number) => {
    const updatedInsuranceArr = insuranceArr.filter((t) => t.id !== typeId);
    setInsuranceArr(recalcAll(updatedInsuranceArr));

    const updatedExpanded = { ...expandedTypes };
    delete updatedExpanded[typeId];
    setExpandedTypes(updatedExpanded);
  };

  // Helper to calculate % totals
  const calcTotalPercentage = <T extends { percentage: number }>(items: T[]) =>
    items.reduce((sum, i) => sum + (i.percentage || 0), 0);

  // Recalculate all nested totals
  const recalcAll = (data: Type[]) => {
    return data.map((type) => {
      const typeTotal = calcTotalPercentage(data);
      const isTypeInvalid = typeTotal > 100;

      const typeAmount = isTypeInvalid ? 0 : (totalInsuranceBudget * type.percentage) / 100;
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
  // Change Type field
  const handleInsuranceTypeChanges = (
    typeId: string | number,
    field: keyof Type,
    value: string | number
  ) => {
    const updated = insuranceArr.map((t) =>
      t.id === typeId ? { ...t, [field]: value } : t
    );
    setInsuranceArr(recalcAll(updated));
  };

  // Add Category
  const addCategory = (typeId: string | number) => {
    const newCatId = uuidv4();
    setInsuranceArr(
      insuranceArr.map((t) =>
        t.id === typeId
          ? {
              ...t,
              categories: [
                ...t.categories,
                {
                  id: newCatId,
                  name: "",
                  percentage: 0,
                  allottedAmount: 0,
                  spentAmount: 0,
                  balanceAmount: 0,
                  details: [],
                },
              ],
            }
          : t
      )
    );
    setExpandedCategories((prev) => ({ ...prev, [newCatId]: true }));
  };

  // Delete Category
  const deleteCategory = (typeId: string | number, catId: string | number) => {
    const updatedInsuranceArr = insuranceArr.map((t) =>
      t.id === typeId
        ? {
            ...t,
            categories: t.categories.filter((cat) => cat.id !== catId),
          }
        : t
    );
    setInsuranceArr(recalcAll(updatedInsuranceArr));
  };

  // Category field change
  const handleCategoryChanges = (
    typeId: string | number,
    catId: string | number,
    field: keyof Category,
    value: string | number
  ) => {
    const updatedInsuranceArr = insuranceArr.map((t) => {
      if (t.id === typeId) {
        return {
          ...t,
          categories: t.categories.map((cat) =>
            cat.id === catId ? { ...cat, [field]: value } : cat
          ),
        };
      }
      return t;
    });
    setInsuranceArr(recalcAll(updatedInsuranceArr));
  };

  // Add Policy (fund-level)
  const addPolicy = (typeId: string | number, catId: string | number) => {
    setInsuranceArr(
      insuranceArr.map((t) =>
        t.id === typeId
          ? {
              ...t,
              categories: t.categories.map((cat) =>
                cat.id === catId
                  ? {
                      ...cat,
                      details: [
                        ...cat.details,
                        {
                          id: uuidv4(),
                          name: "",
                          percentage: 0,
                          allottedAmount: 0,
                          spentAmount: 0,
                          balanceAmount: 0
                        },
                      ],
                    }
                  : cat
              ),
            }
          : t
      )
    );
  };

  // Handle policy field change
  const handlePolicyChanges = (
    typeId: string | number,
    catId: string | number,
    fundId: string | number,
    field: keyof Detail,
    value: string | number
  ) => {
    const updatedInsuranceArr = insuranceArr.map((t) => {
      if (t.id === typeId) {
        return {
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
        };
      }
      return t;
    });
    setInsuranceArr(recalcAll(updatedInsuranceArr));
  };

  const deletePolicy = (
    typeId: string | number,
    catId: string | number,
    fundId: string | number
  ) => {
    const updatedInsuranceArr = insuranceArr.map((t) =>
      t.id === typeId
        ? {
            ...t,
            categories: t.categories.map((cat) =>
              cat.id === catId
                ? {
                    ...cat,
                    details: cat.details.filter((fund) => fund.id !== fundId),
                  }
                : cat
            ),
          }
        : t
    );
    setInsuranceArr(recalcAll(updatedInsuranceArr));
  };

  // Fetch insurance config
  useEffect(() => {
    if (!profileId || !sectionId || sectionId == 0 || typeof sectionId === "string") {
      setInsuranceArr([]);
      return;
    }

    axios
      .get(`${API_BASE}/fetchFinanceTypeConfig`, { params: { sectionId } })
      .then((res) => {
        if (res.data) {
          setInsuranceArr(res.data);
          console.log("Fetched Insurance Config:", res.data);
        }
      })
      .catch((err) => console.error("Error fetching insurance config:", err));
  }, [profileId, month, year, sectionId]);

  // Save Insurance Config
  const saveInsuranceConfig = () => {
    if (sectionId == null || typeof sectionId === "string" || sectionId == 0) {
      alert("Save the Budget Configuration with valid Insurance section before saving Insurance Configuration.");
      return;
    }

    const updatedInsurance = insuranceArr.map((insurance) => ({
      ...insurance,
      id: typeof insurance.id === "string" ? 0 : insurance.id,
      categories: insurance.categories.map((category) => ({
        ...category,
        id: typeof category.id === "string" ? 0 : category.id,
        details: category.details.map((detail) => ({
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
      financeTypes: updatedInsurance,
    };

    axios
      .post(`${API_BASE}/saveOrUpdateFinanceTypeConfig`, payload)
      .then((res) => {
        alert("Insurance configuration saved successfully!");
        if (res.data) setInsuranceArr(res.data);
      })
      .catch(() => alert("Error saving insurance configuration."));
  };

  const toggleAll = () => {
    const newState = !expandedAll;
    setExpandedAll(newState);

    const newExpandedTypes: { [key: string]: boolean } = {};
    const newExpandedCats: { [key: string]: boolean } = {};
    insuranceArr.forEach((type) => {
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
      <h3 className="text-center mb-4">Insurance Configuration</h3>
      <p>
        <strong>Total Insurance Budget:</strong>{" "}
        {totalInsuranceBudget.toLocaleString("en-IN")}
      </p>

      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-primary" onClick={addInsuranceType}>
          + Add Insurance Type
        </button>
        <button className="btn btn-outline-secondary" onClick={toggleAll}>
          {expandedAll ? "-" : "+"}
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          Insurance Configuration Details
        </div>
        <div className="card-body bg-light">
          {insuranceArr.map((type, typeIndex) => {
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
                      placeholder="Insurance Type (e.g. Health, Life, Vehicle, etc.,)"
                      value={type.name}
                      onChange={(e) =>
                        handleInsuranceTypeChanges(type.id, "name", e.target.value.toUpperCase())
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
                        handleInsuranceTypeChanges(type.id, "percentage", Number(e.target.value))
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
                      onClick={() => deleteInsuranceType(type.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Categories */}
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
                              placeholder="Category (e.g. Term, ULIP, Endowment, etc.,)"
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
                              onClick={() => addPolicy(type.id, cat.id)}
                            >
                              + Add Policy
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => deleteCategory(type.id, cat.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Policy Details */}
                        {catExpanded &&
                          cat.details.map((policy, policyIndex) => (
                            <div
                              key={policy.id}
                              className="ms-5 row mb-2 p-2 align-items-center bg-white rounded"
                            >
                              <div className="col-md-1 fw-semibold">
                                {typeIndex + 1}.{catIndex + 1}.{policyIndex + 1}
                              </div>

                              <div className="col-md-3">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Policy Name"
                                  value={policy.name}
                                  onChange={(e) =>
                                    handlePolicyChanges(
                                      type.id,
                                      cat.id,
                                      policy.id,
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
                                  value={policy.percentage}
                                  onChange={(e) =>
                                    handlePolicyChanges(
                                      type.id,
                                      cat.id,
                                      policy.id,
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
                                  value={`₹${policy.allottedAmount.toLocaleString(
                                    "en-IN",
                                    { maximumFractionDigits: 0 }
                                  )}`}
                                />
                              </div>

                              <div className="col-md-3 text-end">
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    deletePolicy(type.id, cat.id, policy.id)
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
            <button
              className="btn btn-success px-4"
              onClick={saveInsuranceConfig}
            >
              Save Insurance Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceConfiguration;
