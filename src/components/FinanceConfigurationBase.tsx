import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import type { Section} from "../types/Budget";
import type { Type, Category, Detail} from "../types/Finance";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";

export interface FinanceBaseProps {
  sectionArr: Section[];
  sectionName: string;                // "investments" or "insurance"
  title: string;                      // Heading text
  typeLabel: string;                  // "Investment Type" or "Insurance Type"
  typePlaceholder: string;            // Type placeholder text.
  categoryLabel: string;              // Category placeholder text
  categoryPlaceholder: string;        // Category placeholder text.
  detailLabel: string;                // Fund / Policy label
  detailLabelPlaceholder: string;       // Fund / Policy placeholder text
}



const API_BASE = "http://localhost:8080/mrFinMateService";

const FinanceConfigurationBase: React.FC<FinanceBaseProps> = ({
  sectionArr,
  sectionName,
  title,
  typeLabel,
  typePlaceholder,
  categoryLabel,
  categoryPlaceholder,
  detailLabel,
  detailLabelPlaceholder
}) => {

  const { profileId, month, year } = useProfileMonthYear();



  const [financeArr, setFinanceArr] = useState<Type[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number | string>(0);

  // NEW: track expand/collapse states
  const [expandedAll, setExpandedAll] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<{ [key: string]: boolean }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  // Whenever sections change, update allocated section budget correctly
  useEffect(() => {
    const section = sectionArr.find(
      (s) => s.name?.toLowerCase() === sectionName.toLowerCase()
    );

    setTotalBudget(section?.allocatedAmount || 0);
    setSectionId(section?.id || 0);

    console.log("Investment", section);
    console.log("Investment Section ID:", section?.id || 0);

    // Optionally recalc nested investment structure
    setFinanceArr((prev) => recalcAll(prev));
  }, [sectionArr]);

  // Add new items
  const addFinanceType = () => {
    const newId = uuidv4();
    setFinanceArr([
      ...financeArr,
      {
        id: newId,
        sectionId: sectionId,
        name: "",
        percentage: 0,
        allottedAmount: 0,
        spentAmount: 0,
        balanceAmount: 0,
        categories: []
      },
    ]);
    setExpandedTypes((prev) => ({ ...prev, [newId]: true }));
  };

  // Delete items
  const deleteFinanceType = (typeId: string | number) => {
    const updatedFinanceArr = financeArr.filter((t) => t.id !== typeId);
    setFinanceArr(recalcAll(updatedFinanceArr));

    const updatedExpanded = { ...expandedTypes };
    delete updatedExpanded[typeId];
    setExpandedTypes(updatedExpanded);
  };

  // Recalculate all nested values
  const recalcAll = (data: Type[]) => {
    return data.map((type) => {

      const typeTotal = calcTotalPercentage(data);
      const isTypeInvalid = typeTotal > 100;

      const typeAmount = isTypeInvalid ? 0 : (totalBudget * type.percentage) / 100;
      type.allottedAmount = typeAmount;

      const catTotal = calcTotalPercentage(type.categories);
      const isCatInvalid = catTotal > 100;

      type.categories = type.categories.map((cat) => {
        const catAmount = isCatInvalid ? 0 : (typeAmount * cat.percentage) / 100;
        cat.allottedAmount = catAmount;

        const fundTotal = calcTotalPercentage(cat.details);
        const isFundInvalid = fundTotal > 100;

        cat.details = cat.details.map(
          (financeDetail) => ({
            ...financeDetail,
            allottedAmount: isFundInvalid ? 0 : (catAmount * financeDetail.percentage) / 100,
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
  const handleFinanceTypeChanges = (
    typeId: string | number,
    field: keyof Type,
    value: string | number
  ) => {
    const updated = financeArr.map((t) =>
      t.id === typeId ? { ...t, [field]: value } : t
    );
    setFinanceArr(recalcAll(updated));
  };

  // Add Category
  const addFinanceCategory = (typeId: string | number) => {
    const newCatId = uuidv4();
    setFinanceArr(
      financeArr.map((t) =>
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
                details: []
              },
            ],
          }
          : t
      )
    );
    setExpandedCategories((prev) => ({ ...prev, [newCatId]: true }));
  };

  const deleteCategory = (typeId: string | number, catId: string | number) => {
    const updatedFinanceArr = financeArr.map((t) =>
      t.id === typeId
        ? {
          ...t,
          categories: t.categories.filter(
            (cat) => cat.id !== catId
          ),
        }
        : t
    );
    setFinanceArr(recalcAll(updatedFinanceArr));
  };

  const handleCategoryChanges = (
    typeId: string | number,
    catId: string | number,
    field: keyof Category,
    value: string | number
  ) => {
    const updatedFinanceArr = financeArr.map((t) => {
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
    setFinanceArr(recalcAll(updatedFinanceArr));
  };

  const addFinanceDetail = (
    typeId: string | number,
    catId: string | number
  ) => {
    setFinanceArr(
      financeArr.map((t) =>
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

  const handleFinanceDetailChanges = (
    typeId: string | number,
    catId: string | number,
    detailId: string | number,
    field: keyof Detail,
    value: string | number
  ) => {
    const updatedFinanceArr = financeArr.map((t) => {
      if (t.id === typeId) {
        return {
          ...t,
          categories: t.categories.map((cat) =>
            cat.id === catId
              ? {
                ...cat,
                details: cat.details.map((detail) =>
                  detail.id === detailId ? { ...detail, [field]: value } : detail
                ),
              }
              : cat
          ),
        };
      }
      return t;
    });
    setFinanceArr(recalcAll(updatedFinanceArr));
  };

  const deleteFinanceDetail = (
    typeId: string | number,
    catId: string | number,
    detailId: string | number
  ) => {
    const updatedFinanceArr = financeArr.map((t) =>
      t.id === typeId
        ? {
          ...t,
          categories: t.categories.map((cat) =>
            cat.id === catId
              ? {
                ...cat,
                details: cat.details.filter(
                  (detail) => detail.id !== detailId
                ),
              }
              : cat
          ),
        }
        : t
    );
    setFinanceArr(recalcAll(updatedFinanceArr));
  };

  // Fetch investment  config for selected profile + month + year
  useEffect(() => {
    if (!profileId || !sectionId || sectionId == 0 || typeof sectionId === "string") {
    console.log("Skipping fetch - invalid sectionId or profileId", sectionId);
    setFinanceArr([]); // clear UI when no section found
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
          setFinanceArr(res.data);
          console.log("Fetched Investment Config:", res.data);
        }
      });
  }, [profileId, month, year, sectionId]);

  // Save config
  const saveConfig = () => {
    console.log("Saving Investment Config:", financeArr);
    console.log("sectionId:", sectionId);
    if(sectionId == null || typeof sectionId ==="string" || sectionId ==0){
      alert(`Save the Budget Configuration before saving ${title}.`);
      return;
    }
    
    // Prepare payload by removing the temporary string IDs created via uuidv4
    const updatedInvestments = financeArr.map((financeType) => ({
    ...financeType,
    id: typeof financeType.id === "string" ? 0 : financeType.id, // top-level (FinanceType)
    categories: financeType.categories.map((category) => ({
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
        alert(`${title} saved successfully!`);

        if (res.data) {
          setFinanceArr(res.data);
        }
      })
      .catch(() => alert("Error saving configuration."));
  };

  // NEW: toggle all
  const toggleAll = () => {
    const newState = !expandedAll;
    setExpandedAll(newState);
    const newExpandedTypes: { [key: string]: boolean } = {};
    const newExpandedCats: { [key: string]: boolean } = {};
    financeArr.forEach((type) => {
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
      <h3 className="text-center mb-4">{title}</h3>
      <p>
        <strong>Total Allocated Budget:</strong>{" "} {totalBudget.toLocaleString("en-IN")}
      </p>

      {/* Global expand/collapse */}
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-primary" onClick={addFinanceType}>
          + Add {typeLabel}
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
          {title} Details
        </div>
        <div className="card-body bg-light">
          {/* Investment Types */}
          {financeArr.map((financeType, financeTypeIndex) => {
            const typeExpanded = expandedTypes[financeType.id] ?? true;
            return (
              <div key={financeType.id} className="mb-3 p-3 bg-white rounded shadow-sm">
                <div className="row align-items-center mb-2">
                  <div className="col-md-1 d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() =>
                        setExpandedTypes((prev) => ({
                          ...prev,
                          [financeType.id]: !typeExpanded,
                        }))
                      }
                    >
                      {typeExpanded ? "-" : "+"}
                    </button>
                    <span className="fw-bold">{financeTypeIndex + 1}</span>
                  </div>

                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`${typeLabel}  ${typePlaceholder}`}
                      value={financeType.name}
                      onChange={(e) =>
                        handleFinanceTypeChanges(
                          financeType.id,
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
                      value={financeType.percentage}
                      onChange={(e) =>
                        handleFinanceTypeChanges(
                          financeType.id,
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
                      value={`₹${financeType.allottedAmount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}`}
                    />
                  </div>
                  <div className="col-md-3 text-end">
                    <button
                      className="btn btn-outline-success me-2"
                      onClick={() => addFinanceCategory(financeType.id)}
                    >
                      + Add Category
                    </button>


                    <button
                      className="btn btn-outline-danger"
                      onClick={() => deleteFinanceType(financeType.id)}>
                      Delete
                    </button>
                  </div>
                </div>


                {/* Categories */}
                {typeExpanded && financeType.categories.map((financeCategory, financeCategoryIndex) => {
                  const catExpanded = expandedCategories[financeCategory.id] ?? true;
                  return (
                    <div
                      key={financeCategory.id}
                      className="ms-4 p-3 mb-3 bg-light rounded"
                    >
                      <div className="row align-items-center mb-2">
                        <div className="col-md-1 d-flex align-items-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() =>
                              setExpandedCategories((prev) => ({
                                ...prev,
                                [financeCategory.id]: !catExpanded,
                              }))
                            }
                          >
                            {catExpanded ? "-" : "+"}
                          </button>
                          <span className="fw-semibold">
                            {financeTypeIndex + 1}.{financeCategoryIndex + 1}
                          </span>
                        </div>


                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`${categoryLabel} ${categoryPlaceholder}`}
                            value={financeCategory.name}
                            onChange={(e) =>
                              handleCategoryChanges(
                                financeType.id,
                                financeCategory.id,
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
                            value={financeCategory.percentage}
                            onChange={(e) =>
                              handleCategoryChanges(
                                financeType.id,
                                financeCategory.id,
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
                            value={`₹${financeCategory.allottedAmount.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}`}
                          />
                        </div>
                        <div className="col-md-3 text-end">
                          <button
                            className="btn btn-outline-primary me-2"
                            onClick={() => addFinanceDetail(financeType.id, financeCategory.id)}
                          >
                            + Add {detailLabel}
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => deleteCategory(financeType.id, financeCategory.id)}>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Finance Details */}
                      {catExpanded && financeCategory.details.map((financeDetail, financeDetailIndex) => (
                        <div
                          key={financeDetail.id}
                          className="ms-5 row mb-2 p-2 align-items-center bg-white rounded"
                        >
                          <div className="col-md-1 fw-semibold">
                            {financeTypeIndex + 1}.{financeCategoryIndex + 1}.{financeDetailIndex + 1}
                          </div>
                          <div className="col-md-3">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`${detailLabel} ${detailLabelPlaceholder}`}
                              value={financeDetail.name}
                              onChange={(e) =>
                                handleFinanceDetailChanges(
                                  financeType.id,
                                  financeCategory.id,
                                  financeDetail.id,
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
                              value={financeDetail.percentage}
                              onChange={(e) =>
                                handleFinanceDetailChanges(
                                  financeType.id,
                                  financeCategory.id,
                                  financeDetail.id,
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
                              value={`₹${financeDetail.allottedAmount.toLocaleString(
                                "en-IN",
                                { maximumFractionDigits: 0 }
                              )}`}
                            />
                          </div>
                          <div className="col-md-3 text-end">
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => deleteFinanceDetail(financeType.id, financeCategory.id, financeDetail.id)}
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
              onClick={saveConfig}
            >
              Save {title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceConfigurationBase;
