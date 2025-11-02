export type Section = {
    id: string | number | null;     // unique id
    name: string;   // e.g., "Needs", "Wants", "Savings"
    percentage: number;     // user-defined percentage (0-100)
    allocatedAmount: number; // calculated amount based on salary
};

export type BudgetConfig = {
    profileId: number;
    month: string;      // e.g., "January"
    year: string;       // e.g., "2024"
    actualSalary: number;       // actual salary input by user
    budgetPercentage: number;  // percentage of salary to consider for budgeting
    budgetSalary: number;      // calculated budget salary
    createdUser: string;
    updatedUser: string;
    deletedDate: string | null;
    createdDate: string;
    updatedDate: string;
    sections: Section[];  // array of sections
};