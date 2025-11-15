// src/pentadbir/template.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// --- Score Description Schema ---
@Schema({ _id: false })
class ScoreDescription {
  @Prop({ required: true })
  score: number; // 0-4

  @Prop({ required: true })
  label: string; // e.g., "Cemerlang", "Baik", "Sederhana"

  @Prop({ required: true })
  description: string; // Criteria for this score
}
const ScoreDescriptionSchema = SchemaFactory.createForClass(ScoreDescription);

// --- Rubric Item Schema ---
@Schema({ _id: false })
class RubricItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  maxScore: number;

  @Prop({ type: [ScoreDescriptionSchema], default: [] })
  scoreDescriptions: ScoreDescription[]; // Array of score 0-4 descriptions
}
const RubricItemSchema = SchemaFactory.createForClass(RubricItem);

// --- Rubric Sub-Category Schema ---
@Schema({ _id: false })
class RubricSubCategory {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [RubricItemSchema], default: [] })
  items: RubricItem[];
}
const RubricSubCategorySchema = SchemaFactory.createForClass(RubricSubCategory);

// --- Rubric Category Schema ---
@Schema({ _id: false })
class RubricCategory {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [RubricSubCategorySchema], default: [] })
  subCategories: RubricSubCategory[];
}
const RubricCategorySchema = SchemaFactory.createForClass(RubricCategory);

// --- Main Template Rubric Schema ---
@Schema({ timestamps: true })
export class TemplateRubric extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: 4 })
  scaleSkor: number;

  @Prop({ type: [RubricCategorySchema], default: [] })
  categories: RubricCategory[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TemplateRubricSchema = SchemaFactory.createForClass(TemplateRubric);

// Update the updatedAt field on save
TemplateRubricSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Ensure a virtual 'id' field is exposed (frontend expects 'id' not '_id')
TemplateRubricSchema.virtual('id').get(function() {
  // @ts-ignore _id exists on mongoose document
  return this._id.toString();
});

// Include virtuals when converting to JSON/Object so the frontend receives 'id'
TemplateRubricSchema.set('toJSON', { virtuals: true });
TemplateRubricSchema.set('toObject', { virtuals: true });