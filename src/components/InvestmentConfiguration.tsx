import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import type { Section} from "../types/Budget";
import type { Type, Category, Detail} from "../types/Finance";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";

interface InvestmentConfiguraitonProps {
  sectionArr: Section[];
}



const API_BASE = "http://localhost:8080/mrFinMateService";

const InvestmentConfiguration: React.FC<InvestmentConfiguraitonProps> = ({
  sectionArr
}) => {

  const { profileId, month, year } = useProfileMonthYear();



  const [investmentArr, setInvestmentArr] = useState<Type[]>([]);
  const [totalInvestmentBudget, setTotalInvestmentBudget] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number | string>(0);

  // NEW: track expand/collapse states
  const [expandedAll, setExpandedAll] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<{ [key: string]: boolean }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  // Whenever sections change, update investment budget
  useEffect(() => {
    const investmentSection = sectionArr.find(
      (s) => s.name?.toLowerCase() === "investments"
    );
    const newBudget = investmentSection?.allocatedAmount || 0;
    console.log("Updated Investment Budget:", newBudget);
    setTotalInvestmentBudget(newBudget);
    setSectionId(investmentSection?.id || 0);

    console.log("Investment", investmentSection);
    console.log("Investment Section ID:", investmentSection?.id || 0);

    // Optionally recalc nested investment structure
    setInvestmentArr((prev) => recalcAll(prev));
  }, [sectionArr]);

  // Add new items
  const addInvestmentType = () => {
    const newId = uuidv4();
    setInvestmentArr([
      ...investmentArr,
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

  // Delete items
  const deleteInvestmentType = (typeId: string | number) => {
    const updatedInvestmentArr = investmentArr.filter((t) => t.id !== typeId);
    setInvestmentArr(recalcAll(updatedInvestmentArr));

    const updatedExpanded = { ...expandedTypes };
    delete updatedExpanded[typeId];
    setExpandedTypes(updatedExpanded);
  };

  // Recalculate all nested values
  const recalcAll = (data: Type[]) => {
    return data.map((type) => {

      const typeTotal = calcTotalPercentage(data);
      const isTypeInvalid = typeTotal > 100;

      const typeAmount = isTypeInvalid ? 0 : (totalInvestmentBudget * type.percentage) / 100;
      type.allottedAmount = typeAmount;

      const catTotal = calcTotalPercentage(type.categories);
      const isCatInvalid = catTotal > 100;

      type.categories = type.categories.map((cat) => {
        const catAmount = isCatInvalid ? 0 : (typeAmount * cat.percentage) / 100;
        cat.allottedAmount = catAmount;

        const fundTotal = calcTotalPercentage(cat.details);
        const isFundInvalid = fundTotal > 100;

        cat.details = cat.details.map(
          (investmentDetail) => ({
            ...investmentDetail,
            allottedAmount: isFundInvalid ? 0 : (catAmount * investmentDetail.percentage) / 100,
          })
        );
        return { ...cat };
      });
      return { ...type };
    });
  };

  // Helper to calculate total %
  const calcTotalPercentage = <T extends { percentage: number }>(items: T[]) =>
    items.reduce((sum, i) => sum + (i.percentage || 0), 0);

  // Change handlers
  const handleInvestmentTypeChanges = (
    typeId: string | number,
    field: keyof Type,
    value: string | number
  ) => {
    const updated = investmentArr.map((t) =>
      t.id === typeId ? { ...t, [field]: value } : t
    );
    setInvestmentArr(recalcAll(updated));
  };

  // Add Category
  const addCategory = (typeId: string | number) => {
    const newCatId = uuidv4();
    setInvestmentArr(
      investmentArr.map((t) =>
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

  const deleteCategory = (typeId: string | number, catId: string | number) => {
    const updatedInvestmentArr = investmentArr.map((t) =>
      t.id === typeId
        ? {
          ...t,
          categories: t.categories.filter(
            (cat) => cat.id !== catId
          ),
        }
        : t
    );
    setInvestmentArr(recalcAll(updatedInvestmentArr));
  };

  const handleCategoryChanges = (
    typeId: string | number,
    catId: string | number,
    field: keyof Category,
    value: string | number
  ) => {
    const updatedInvestmentArr = investmentArr.map((t) => {
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
    setInvestmentArr(recalcAll(updatedInvestmentArr));
  };

  const addInvestmentDetail = (
    typeId: string | number,
    catId: string | number
  ) => {
    setInvestmentArr(
      investmentArr.map((t) =>
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

  const handleFundChanges = (
    typeId: string | number,
    catId: string | number,
    fundId: string | number,
    field: keyof Detail,
    value: string | number
  ) => {
    const updatedInvestmentArr = investmentArr.map((t) => {
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
    setInvestmentArr(recalcAll(updatedInvestmentArr));
  };

  const deleteFund = (
    typeId: string | number,
    catId: string | number,
    fundId: string | number
  ) => {
    const updatedInvestmentArr = investmentArr.map((t) =>
      t.id === typeId
        ? {
          ...t,
          categories: t.categories.map((cat) =>
            cat.id === catId
              ? {
                ...cat,
                details: cat.details.filter(
                  (fund) => fund.id !== fundId
                ),
              }
              : cat
          ),
        }
        : t
    );
    setInvestmentArr(recalcAll(updatedInvestmentArr));
  };

  // Fetch investment  config for selected profile + month + year
  useEffect(() => {
    if (!profileId || !sectionId || sectionId == 0 || typeof sectionId === "string") {
    console.log("Skipping fetch - invalid sectionId or profileId", sectionId);
    setInvestmentArr([]); // clear UI when no section found
    return;
    }

    axios
      .get(`${API_BASE}/fetchFinanceTypeConfig`, {
        params: {
          sectionId
        },
      })
      .then((res) => {
        if (res.data) {
          setInvestmentArr(res.data);
          console.log("Fetched Investment Config:", res.data);
        }
      });
  }, [profileId, month, year, sectionId]);

  // Save config
  const saveInvestmentConfig = () => {
    console.log("Saving Investment Config:", investmentArr);
    console.log("sectionId:", sectionId);
    if(sectionId == null || typeof sectionId ==="string" || sectionId ==0){
      alert("Save the Budget Configuration with valid Investment section before saving Investment Configuration.");
      return;
    }
    
    // Prepare payload by removing the temporary string IDs created via uuidv4
    const updatedInvestments = investmentArr.map((investment) => ({
    ...investment,
    id: typeof investment.id === "string" ? 0 : investment.id, // top-level (FinanceType)
    categories: investment.categories.map((category) => ({
      ...category,
      id: typeof category.id === "string" ? 0 : category.id, // nested (FinanceCategory)
      details: category.details.map((detail) => ({
        ...detail,
        id: typeof detail.id === "string" ? 0 : detail.id, // deeply nested (FinanceDetail)
      })),
    })),
  }));

    console.log("Prepared Payload:", updatedInvestments);
    console.log("Prepared Payload updated:", updatedInvestments);
    const payload = {
      profileId: profileId,
      month: month,
      year: year,
      sectionId,
      financeTypes: updatedInvestments
    };

    console.log("payload:", payload);
    axios
      .post(`${API_BASE}/saveOrUpdateFinanceTypeConfig`, payload)
      .then((res) => {
        alert("Investment configuration saved successfully!");

        if (res.data) {
          setInvestmentArr(res.data);
        }
      })
      .catch(() => alert("Error saving investment configuration."));
  };

  // NEW: toggle all
  const toggleAll = () => {
    const newState = !expandedAll;
    setExpandedAll(newState);
    const newExpandedTypes: { [key: string]: boolean } = {};
    const newExpandedCats: { [key: string]: boolean } = {};
    investmentArr.forEach((type) => {
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
      <h3 className="text-center mb-4">Investment Configuration</h3>
      <p>
        <strong>Total Investment Budget:</strong>{" "} {totalInvestmentBudget.toLocaleString("en-IN")}
      </p>

      {/* Global expand/collapse */}
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-primary" onClick={addInvestmentType}>
          + Add Investment Type
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={toggleAll}
        >
          {expandedAll ? "-" : "+"}
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-bold">
          Investment Configuration Details
        </div>
        <div className="card-body bg-light">
          {/* Investment Types */}
          {investmentArr.map((type, typeIndex) => {
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
                      placeholder="Investment Type:- e.g. Mutual Fund, Stocks, Gold, Silver, etc.,"
                      value={type.name}
                      onChange={(e) =>
                        handleInvestmentTypeChanges(
                          type.id,
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
                      value={type.percentage}
                      onChange={(e) =>
                        handleInvestmentTypeChanges(
                          type.id,
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
                      onClick={() => deleteInvestmentType(type.id)}>
                      Delete
                    </button>
                  </div>
                </div>


                {/* Categories */}
                {typeExpanded && type.categories.map((cat, catIndex) => {
                  const catExpanded = expandedCategories[cat.id] ?? true;
                  return (
                    <div
                      key={cat.id}
                      className="ms-4 p-3 mb-3 bg-light rounded"
                    >
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
                            placeholder="Category Name (e.g. Large Cap, Mid Cap, Gold, Silver, etc.,)"
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
                        <div className="col-md-2 ">
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
                            onClick={() => addInvestmentDetail(type.id, cat.id)}
                          >
                            + Add Fund
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => deleteCategory(type.id, cat.id)}>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Investment Details */}
                      {catExpanded && cat.details.map((fund, fundIndex) => (
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
                              onClick={() => deleteFund(type.id, cat.id, fund.id)}
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
              onClick={saveInvestmentConfig}
            >
              Save Investment Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentConfiguration;
