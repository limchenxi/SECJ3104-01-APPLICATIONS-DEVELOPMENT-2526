// src/pentadbir/dto/template.dto.ts

export class CreateTemplateDto {
  name: string;
  description: string;
  scaleSkor: number;
  categories?: any[];
}

export class UpdateTemplateDto {
  name?: string;
  description?: string;
  scaleSkor?: number;
  categories?: any[];
}

export class CreateCategoryDto {
  code: string;
  name: string;
  description: string;
}

export class UpdateCategoryDto {
  code?: string;
  name?: string;
  description?: string;
}

export class CreateSubCategoryDto {
  code: string;
  name: string;
  description: string;
}

export class UpdateSubCategoryDto {
  code?: string;
  name?: string;
  description?: string;
}

export class CreateItemDto {
  text: string;
  maxScore: number;
}

export class UpdateItemDto {
  text?: string;
  maxScore?: number;
}