// src/question/question.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionTemplate } from './question.schema'; // <-- RENAMED
import { CreateQuestionDto } from './dto/create-question.dto'; // <-- RENAMED

@Injectable()
export class QuestionService { // <-- RENAMED
  constructor(
    @InjectModel(QuestionTemplate.name) // <-- RENAMED
    private questionModel: Model<QuestionTemplate>, // <-- RENAMED
  ) {}

  // --- Create a new question rubric ---
  async create(dto: CreateQuestionDto): Promise<QuestionTemplate> { // <-- RENAMED
    const newQuestion = new this.questionModel(dto); // <-- RENAMED
    return newQuestion.save();
  }

  // --- Find all available rubrics (for the admin's list) ---
  async findAll(): Promise<QuestionTemplate[]> { // <-- RENAMED
    return this.questionModel.find().select('title description').exec(); // <-- RENAMED
  }

  // --- Find one full rubric by its ID ---
  async findOne(id: string): Promise<QuestionTemplate> { // <-- RENAMED
    const question = await this.questionModel.findById(id).exec(); // <-- RENAMED
    if (!question) { // <-- RENAMED
      throw new NotFoundException(`Question template with ID "${id}" not found`);
    }
    return question; // <-- RENAMED
  }

  // --- (Optional) Update a rubric ---
  async update(id: string, dto: CreateQuestionDto): Promise<QuestionTemplate | null> { // <-- RENAMED
    return this.questionModel.findByIdAndUpdate(id, dto, { new: true }).exec(); // <-- RENAMED
  }

  // --- (Optional) Delete a rubric ---
  async delete(id: string): Promise<any> {
    const result = await this.questionModel.findByIdAndDelete(id).exec(); // <-- RENAMED
    if (!result) {
      throw new NotFoundException(`Question template with ID "${id}" not found`);
    }
    return { message: 'Question template deleted successfully' };
  }
}