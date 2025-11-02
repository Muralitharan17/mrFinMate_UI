import React from "react";
import type { Section } from "../types/Budget";

interface Props {
  section: Section;
  index: number;
  budgetSalary: number;
  handleEdit: (section: Section) => void;
  handleDelete: (id: string | number | null) => void;
}

const BudgetSectionRow: React.FC<Props> = ({ section, index, budgetSalary, handleEdit, handleDelete }) => {
  section.allocatedAmount = ((budgetSalary || 0) * (section.percentage || 0)) / 100;

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{section.name}</td>
      <td>{section.percentage}%</td>
      <td>
        {section.allocatedAmount.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
        })}
      </td>
      <td>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(section)}>Edit</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(section.id)}>Delete</button>
        </div>
      </td>
    </tr>
  );
};

export default BudgetSectionRow;
