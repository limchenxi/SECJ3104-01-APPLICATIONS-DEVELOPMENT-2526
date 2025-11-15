import { backendClient } from "../../../utils/axios-client";
import type { TemplateRubric, RubricCategory, RubricSubCategory, RubricItem } from "../type";

const client = () => backendClient();

// Template CRUD operations
export const getTemplates = async (): Promise<TemplateRubric[]> => {
  const response = await client().get("/pentadbir/templates");
  return response.data;
};

export const getTemplate = async (id: string): Promise<TemplateRubric> => {
  const response = await client().get(`/pentadbir/templates/${id}`);
  return response.data;
};

export const createTemplate = async (template: Omit<TemplateRubric, "id" | "createdAt" | "updatedAt">): Promise<TemplateRubric> => {
  const response = await client().post("/pentadbir/templates", template);
  return response.data;
};

export const updateTemplate = async (id: string, template: Partial<TemplateRubric>): Promise<TemplateRubric> => {
  const response = await client().put(`/pentadbir/templates/${id}`, template);
  return response.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await client().delete(`/pentadbir/templates/${id}`);
};

// Category operations
export const addCategory = async (templateId: string, category: Omit<RubricCategory, "id">): Promise<RubricCategory> => {
  const response = await client().post(`/pentadbir/templates/${templateId}/categories`, category);
  return response.data;
};

export const updateCategory = async (templateId: string, categoryId: string, category: Partial<RubricCategory>): Promise<RubricCategory> => {
  const response = await client().put(`/pentadbir/templates/${templateId}/categories/${categoryId}`, category);
  return response.data;
};

export const deleteCategory = async (templateId: string, categoryId: string): Promise<void> => {
  await client().delete(`/pentadbir/templates/${templateId}/categories/${categoryId}`);
};

// SubCategory operations
export const addSubCategory = async (templateId: string, categoryId: string, subCategory: Omit<RubricSubCategory, "id">): Promise<RubricSubCategory> => {
  const response = await client().post(`/pentadbir/templates/${templateId}/categories/${categoryId}/subcategories`, subCategory);
  return response.data;
};

export const updateSubCategory = async (templateId: string, categoryId: string, subCategoryId: string, subCategory: Partial<RubricSubCategory>): Promise<RubricSubCategory> => {
  const response = await client().put(`/pentadbir/templates/${templateId}/categories/${categoryId}/subcategories/${subCategoryId}`, subCategory);
  return response.data;
};

export const deleteSubCategory = async (templateId: string, categoryId: string, subCategoryId: string): Promise<void> => {
  await client().delete(`/pentadbir/templates/${templateId}/categories/${categoryId}/subcategories/${subCategoryId}`);
};

// Item operations
export const addItem = async (templateId: string, categoryId: string, subCategoryId: string, item: Omit<RubricItem, "id">): Promise<RubricItem> => {
  const response = await client().post(`/pentadbir/templates/${templateId}/categories/${categoryId}/subcategories/${subCategoryId}/items`, item);
  return response.data;
};

export const updateItem = async (templateId: string, categoryId: string, subCategoryId: string, itemId: string, item: Partial<RubricItem>): Promise<RubricItem> => {
  const response = await client().put(`/pentadbir/templates/${templateId}/categories/${categoryId}/subcategories/${subCategoryId}/items/${itemId}`, item);
  return response.data;
};

export const deleteItem = async (templateId: string, categoryId: string, subCategoryId: string, itemId: string): Promise<void> => {
  await client().delete(`/pentadbir/templates/${templateId}/categories/${categoryId}/subcategories/${subCategoryId}/items/${itemId}`);
};

// Bulk operations for efficiency
export const saveTemplateChanges = async (templateId: string, template: TemplateRubric): Promise<TemplateRubric> => {
  const response = await client().put(`/pentadbir/templates/${templateId}/bulk`, template);
  return response.data;
};

// Get templates available to teachers for evaluation
export const getAvailableTemplates = async (): Promise<TemplateRubric[]> => {
  const response = await client().get("/templates/available");
  return response.data;
};