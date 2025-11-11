export interface Type {
  id: string | number;
  sectionId: string | number;
  name: string;
  percentage: number;
  allottedAmount: number;
  spentAmount: number;
  balanceAmount: number;
  categories: Category[];
}

export interface Category {
  id: string | number;
  name: string;
  percentage: number;
  allottedAmount: number;
  spentAmount: number;
  balanceAmount: number;
  details: Detail[];
}

export interface Detail {
  id: string | number;
  name: string;
  percentage: number;
  allottedAmount: number;
  spentAmount: number;
  balanceAmount: number;
}