export interface Transaction {
  _id: string;
  value: string;
  category: { _id: string };
  concept: string;
  bank: string;
  subcategory?: string
}
