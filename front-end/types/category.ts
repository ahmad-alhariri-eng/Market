export interface Category {
  id: number;
  name: string;
  children: Category[];
  logo: string | null;
}

export interface CategoriesResponse extends Array<Category> {}

export interface FlatCategory {
  id: number;
  name: string;
  parentId?: number;
  logo: string | null;
}
