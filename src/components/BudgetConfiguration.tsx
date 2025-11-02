import React, {useState, useEffect} from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import type { Section, BudgetConfig } from "../types/Budget";
import BudgetSectionRow from "./BudgetSectionRow";

interface props {
    selectedProfileId: number;
    selectedMonth: string;
    selectedYear: string;
}

const API_BASE = "http://localhost:8080/mrFinMateService";
const sectionOptions = ["Needs", "Wants", "Savings", "Investments", "Insurance"];

const BudgetConfiguration: React.FC<props> = ({selectedProfileId, selectedMonth, selectedYear}) => {

    const [salary, setSalary] = useState<number>(0);
    const [budgetPercentage, setBudgetPercentage] = useState<number>(0); // NEW STATE
    const [budgetSalary, setBudgetSalary] = useState<number>(0);
    const [sectionArr, setSectionArr] = useState<Section[]>([]);   // dynamic section
    const [selectedSectionName, setSelectedSectionName] = useState<string>("");
    const [selectedSectionPercentage, setSelectedSectionPercentage] = useState<number | "">("");
    const [selectedSectionId, setSelectedSectionId] = useState<string | number | null>(null);

    const loadBudgetConfig = (data: BudgetConfig) => {
        setSalary(data.actualSalary || 0);
        setBudgetPercentage(data.budgetPercentage || 0);
        setBudgetSalary(data.budgetSalary || 0);
        setSectionArr(data.sections || []);
    };

    // Fetch budget config for selected profile + month + year
    useEffect(() => {
        if (!selectedProfileId) return;

        axios.get(`${API_BASE}/fetchBudgetConfig`, { params: { profileId: selectedProfileId, month: selectedMonth, year: selectedYear } }).then(res => {
            if (res.data) {
                loadBudgetConfig(res.data as BudgetConfig);
            } else {
                setSalary(0);
                setSectionArr([]);
                setBudgetPercentage(0);
                setBudgetSalary(0);
            }
        });
    }, [selectedProfileId, selectedMonth, selectedYear]);

    useEffect(() => {
        setBudgetSalary(((salary || 0) * (budgetPercentage || 0)) / 100);
    }, [salary, budgetPercentage]);

    // Calculate total percentage
    const totalPercentage = sectionArr.reduce((sum, s) => sum + (s.percentage || 0), 0);

    const handleEdit = (section : Section) => {
        setSelectedSectionName(section.name);
        setSelectedSectionPercentage(section.percentage);
        setSelectedSectionId(section.id);
    };

    const handleDelete = (sectionId: string | number | null) => {
        if (!sectionId) return;
        if (window.confirm("Are you sure you want to delete this section?")) {
            setSectionArr(sectionArr.filter(s => s.id !== sectionId));
        }
    };

    const handleAddOrUpdate = () => {
        if(!selectedSectionName || !selectedSectionPercentage || selectedSectionPercentage < 0) return;

        if(selectedSectionId) {
            // update existing section
            setSectionArr(
                sectionArr.map(s => s.id === selectedSectionId ? {...s, name: selectedSectionName, percentage: Number(selectedSectionPercentage)} : s)
            );
            setSelectedSectionId(null);
        } else {
            // Add new
            const exists = sectionArr.some((s) => s.name === selectedSectionName);
            if (exists) return alert("Section already exists!");

            const newSection: Section = {
                id : uuidv4(),
                name: selectedSectionName,
                percentage: Number(selectedSectionPercentage),
                allocatedAmount:Number(0)
            };

            setSectionArr([...sectionArr, newSection]);
        }

        setSelectedSectionName("");
        setSelectedSectionPercentage("");
    };

    // save Budge configuration to local storage
    const saveBudgetConfig = () => {
        if (!selectedProfileId || !salary || !selectedMonth || !selectedYear) {
            const errorMsg = [];
            if(!selectedProfileId){
                errorMsg.push("Please select Profile.");
            }
            if(!selectedMonth){
                errorMsg.push("Please select Month.");
            }
            if(!selectedYear){
                errorMsg.push("Please select Year.");
            }
            if(!salary){
                errorMsg.push("Please provide valid Salary.");
            }

            if (errorMsg.length) {
                return alert(errorMsg.join("\n"));
            }
            
            return alert(errorMsg);
        };

    const updatedSectionArr = sectionArr.map(section => ({
        ...section,
        id: typeof section.id === "string" ? null : section.id  // backend expects Long for saved, null for new
    }));

    const budgetConfig: BudgetConfig = {
        profileId: selectedProfileId,
        month: selectedMonth,
        year: selectedYear,
        actualSalary: salary,
        budgetPercentage: budgetPercentage,
        budgetSalary: budgetSalary,
        createdUser: "",
        updatedUser: "",
        deletedDate: null,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        sections: updatedSectionArr
    };

    axios.post(`${API_BASE}/saveBudgetConfig`, budgetConfig)
        .then(
            res => {
                alert("Configuration saved successfully!");
                if (res.data) {
                    loadBudgetConfig(res.data as BudgetConfig);
                } else {
                    setSalary(0);
                    setSectionArr([]);
                    setBudgetPercentage(0);
                    setBudgetSalary(0);
                }
            }
            
        );
    };

    return (
        <div>
            <h3 className="my-3">Budget Configuration</h3>

            {/* Salary input */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-bold">Actual Salary</label>
                    <input type="number" className="form-control" value={salary} onChange={(e) => setSalary(Number(e.target.value))} placeholder="Enter your salary" />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold">Budget % (%)</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Enter % to consider (e.g., 80)"
                        value={budgetPercentage}
                        onChange={(e) => {
                                setBudgetPercentage(Number(e.target.value));
                            }
                        }
                    />
                </div>
            </div>

            {/* Calculated Budget Salary */}
           
            <div className="alert alert-info text-center">
                <strong>Budget Salary:</strong>{" "}
                    ₹{budgetSalary.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>

            {/* If Total percentage exceeds (>100) */}
            {totalPercentage > 100 && (
                <div className="alert alert-danger">
                    Total allocation exceeds by {totalPercentage - 100}%
                </div>
            )}

            {/* If Total percentage is less than 100 (<100) */}
            {totalPercentage < 100 && totalPercentage != 0 && (
                <div className="alert alert-success">
                    Total allocation is under by {100 - totalPercentage}%
                </div>
            )}

            <div className="d-flex flex-column flex-sm-row align-items-center gap-2 mb-3">
                <select className="form-select" value={selectedSectionName} onChange={(e) => setSelectedSectionName(e.target.value)}>
                    <option value="">Select Section</option>
                    {sectionOptions.map((opt) => (
                        <option key={opt} value={opt}>
                        {opt}
                        </option>
                    ))}
                </select>

                <input type="number" className="form-control" placeholder="Percentage" value={selectedSectionPercentage} onChange={(e) => setSelectedSectionPercentage(Number(e.target.value))} />

                <button className="btn btn-primary" onClick={handleAddOrUpdate}> {selectedSectionId ? "Update Section" : "Add Section"}</button>
            </div>

            {/* Section allocation inputs */}
            {sectionArr.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th style={{ width: "5%" }}>S.No</th>
                                <th style={{ width: "35%" }}>Section Name</th>
                                <th style={{ width: "20%" }}>Percentage (%)</th>
                                <th style={{ width: "25%" }}>Allotted Amount (₹)</th>
                                <th style={{ width: "15%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectionArr.map((section, index) => (
                                <BudgetSectionRow key={section.id} section={section} index={index} budgetSalary={budgetSalary} handleEdit={handleEdit} handleDelete={handleDelete} />
                            ))}
                            <tr>
                                <td colSpan={5} className="fw-bold text-center">
                                    Total Allocation: {totalPercentage}%
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Save Configuration Button */}
            <div className="mt-3 d-flex justify-content-center">
                <button className="btn btn-success" onClick={saveBudgetConfig}>
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default BudgetConfiguration;