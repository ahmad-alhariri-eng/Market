// utils/categoryUtils.ts
import { Category, FlatCategory } from "@/types/category";

export const categoryUtils = {
  // Get all child categories (flattened)
  getChildCategories: (categories: Category[]): FlatCategory[] => {
    const childCategories: FlatCategory[] = [];

    const extractChildren = (category: Category, parentId?: number) => {
      if (category.children && category.children.length > 0) {
        category.children.forEach((child) => {
          childCategories.push({
            id: child.id,
            name: child.name,
            parentId: category.id,
            logo: child.logo,
          });
          extractChildren(child, category.id);
        });
      }
    };

    categories.forEach((category) => extractChildren(category));
    return childCategories;
  },

  // Get child categories for a specific parent
  getChildrenForParent: (
    categories: Category[],
    parentId: number
  ): FlatCategory[] => {
    const parent = categories.find((cat) => cat.id === parentId);
    if (!parent || !parent.children) return [];

    return parent.children.map((child) => ({
      id: child.id,
      name: child.name,
      parentId: parent.id,
      logo: child.logo,
    }));
  },

  // Find parent category for a child
  findParentForChild: (
    categories: Category[],
    childId: number
  ): Category | null => {
    for (const category of categories) {
      if (category.children) {
        const child = category.children.find((c) => c.id === childId);
        if (child) return category;

        // Recursively check children's children
        for (const childCategory of category.children) {
          const found = categoryUtils.findParentForChild(
            [childCategory],
            childId
          );
          if (found) return found;
        }
      }
    }
    return null;
  },
};
