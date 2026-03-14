import React, { useEffect, useState } from "react";
import axios from "axios";
import { useProfileMonthYear } from "../typescript/useProfileMonthYear";
import type { Goal } from "../types/Goal";


const GoalConfiguration: React.FC = () => {
    const { profileId } = useProfileMonthYear();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [goalName, setGoalName] = useState("");
    const [targetAmount, setTargetAmount] = useState<number | "">("");
    const [remarks, setRemarks] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const fetchGoals = async () => {
        if (!profileId) return;
        const res = await axios.get(`http://localhost:8080/mrFinMateService/goalConfig/${profileId}`);
        setGoals(res.data);
    };

    useEffect(() => {
        fetchGoals();
    }, [profileId]);

    const saveGoal = async () => {
        const payload = {
            id: editId,
            profileId: profileId,
            goalName,
            isActive: true,
            targetAmount,
            remarks
        };

        await axios.post(
            "http://localhost:8080/mrFinMateService/goalConfig/save",
            payload
        );

        resetForm();
        fetchGoals();
    };

    const deleteGoal = async (id: number) => {
        
    if (!id) return;
        if (window.confirm("Are you sure you want to delete this configuration?")) {
        try {
            await axios.delete(
                `http://localhost:8080/mrFinMateService/goalConfig/${id}`
            );
            fetchGoals();
        } catch (err) {
            console.error("Failed to delete config:", err);
        }
        }
    };

    const editGoal = (goal: Goal) => {
        setGoalName(goal.goalName);
        setTargetAmount(goal.targetAmount);
        setRemarks(goal.remarks);
        setEditId(goal.id);
        setEditMode(true);
    };

    const resetForm = () => {
        setGoalName("");
        setTargetAmount("");
        setRemarks("");
        setEditId(null);
        setEditMode(false);
    };

    return (
        <div className="container mt-3">
            <h4>Goal Configuration</h4>

            <div className="card p-3 mt-3">
                <div className="row">
                    <div className="col-md-4">
                        <label>Goal Name</label>
                        <input className="form-control" value={goalName}
                               onChange={(e) => setGoalName(e.target.value)} />
                    </div>

                    <div className="col-md-4">
                        <label>Target Amount</label>
                        <input type="number" className="form-control" value={targetAmount}
                               onChange={(e) => setTargetAmount(Number(e.target.value))} />
                    </div>

                    <div className="col-md-4">
                        <label>Remarks</label>
                        <input className="form-control" value={remarks}
                               onChange={(e) => setRemarks(e.target.value)} />
                    </div>
                </div>

                <button className="btn btn-primary mt-3" onClick={saveGoal}>
                    {editMode ? "Update Goal" : "Add Goal"}
                </button>
                {editMode && (
                    <button className="btn btn-secondary mt-3 ms-2" onClick={resetForm}>
                        Cancel
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="card p-3 mt-4">
                <h5>Configured Goals</h5>
                <table className="table table-bordered mt-2">
                    <thead>
                        <tr>
                            <th>Goal Name</th>
                            <th>Target Amount</th>
                            <th>Created Date</th>
                            <th>Updated Date</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {goals.map((g) => (
                            <tr key={g.id}>
                                <td>{g.goalName}</td>
                                <td>₹{g.targetAmount.toLocaleString("en-IN")}</td>
                                <td>{g.createdDate}</td>
                                <td>{g.updatedDate}</td>
                                <td>{g.remarks}</td>
                                <td>
                                    <i
                                    className="bi bi-pencil-square text-primary me-3"
                                    role="button"
                                    title="Edit"
                                    onClick={() => editGoal(g)}
                                    ></i>
                                    <i
                                    className="bi bi-trash text-danger"
                                    role="button"
                                    title="Delete"
                                    onClick={() => deleteGoal(g.id)}
                                    ></i>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GoalConfiguration;
