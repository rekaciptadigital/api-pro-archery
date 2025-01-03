export interface GroupedPriceCategories {
  type: string;
  categories: {
    id: number;
    name: string;
    formula: string | null;
    percentage: number;
    status: boolean;
    created_at: Date;
    updated_at: Date;
  }[];
}