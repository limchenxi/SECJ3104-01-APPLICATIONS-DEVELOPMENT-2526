import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { PentadbirService } from './pentadbir.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

type RequestWithUser = any; // This should match the definition in auth/types.d.ts

@Controller('pentadbir')
@UseGuards(JwtAuthGuard)
export class PentadbirController {
  constructor(private readonly pentadbirService: PentadbirService) {}

  // Check if user is PENTADBIR
  private checkPentadbirRole(req: RequestWithUser) {
    if (req.user.role !== 'PENTADBIR') {
      throw new ForbiddenException('Access denied. PENTADBIR role required.');
    }
  }

  // Check if user can access templates (PENTADBIR or GURU)
  private checkTemplateAccess(req: RequestWithUser) {
    if (!['PENTADBIR', 'GURU', 'SUPERADMIN'].includes(req.user.role)) {
      throw new ForbiddenException(
        'Access denied. PENTADBIR or GURU role required.',
      );
    }
  }

  @Get('dashboard')
  async getDashboard(@Req() req: RequestWithUser) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.getDashboardStats();
  }

  @Get('kedatangan/stats')
  async getKedatanganStats(@Req() req: RequestWithUser) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.getKedatanganStats();
  }

  @Get('cerapan/overview')
  async getCerapanOverview(@Req() req: RequestWithUser) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.getCerapanOverview();
  }

  // Template Management Routes
  @Get('templates')
  async getAllTemplates(@Req() req: RequestWithUser) {
    this.checkTemplateAccess(req);
    return this.pentadbirService.getAllTemplates();
  }

  @Get('templates/:id')
  async getTemplateById(@Req() req: RequestWithUser, @Param('id') id: string) {
    this.checkTemplateAccess(req);
    return this.pentadbirService.getTemplateById(id);
  }

  @Post('templates')
  async createTemplate(
    @Req() req: RequestWithUser,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.createTemplate(createTemplateDto);
  }

  @Put('templates/:id')
  async updateTemplate(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.updateTemplate(id, updateTemplateDto);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Req() req: RequestWithUser, @Param('id') id: string) {
    this.checkPentadbirRole(req);
    await this.pentadbirService.deleteTemplate(id);
    return { message: 'Template deleted successfully' };
  }

  // Category Management Routes
  @Post('templates/:templateId/categories')
  async addCategory(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Body() categoryData: any,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.addCategory(templateId, categoryData);
  }

  @Put('templates/:templateId/categories/:categoryId')
  async updateCategory(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Param('categoryId') categoryId: string,
    @Body() categoryData: any,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.updateCategory(
      templateId,
      categoryId,
      categoryData,
    );
  }

  @Delete('templates/:templateId/categories/:categoryId')
  async deleteCategory(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Param('categoryId') categoryId: string,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.deleteCategory(templateId, categoryId);
  }

  // Sub-Category Management Routes
  @Post('templates/:templateId/categories/:categoryId/subcategories')
  async addSubCategory(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Param('categoryId') categoryId: string,
    @Body() subCategoryData: any,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.addSubCategory(
      templateId,
      categoryId,
      subCategoryData,
    );
  }

  @Put(
    'templates/:templateId/categories/:categoryId/subcategories/:subCategoryId',
  )
  async updateSubCategory(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Param('categoryId') categoryId: string,
    @Param('subCategoryId') subCategoryId: string,
    @Body() subCategoryData: any,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.updateSubCategory(
      templateId,
      categoryId,
      subCategoryId,
      subCategoryData,
    );
  }

  @Delete(
    'templates/:templateId/categories/:categoryId/subcategories/:subCategoryId',
  )
  async deleteSubCategory(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Param('categoryId') categoryId: string,
    @Param('subCategoryId') subCategoryId: string,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.deleteSubCategory(
      templateId,
      categoryId,
      subCategoryId,
    );
  }

  // Item Management Routes
  @Post(
    'templates/:templateId/categories/:categoryId/subcategories/:subCategoryId/items',
  )
  async addItem(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Param('categoryId') categoryId: string,
    @Param('subCategoryId') subCategoryId: string,
    @Body() itemData: any,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.addItem(
      templateId,
      categoryId,
      subCategoryId,
      itemData,
    );
  }

  @Put(
    'templates/:templateId/categories/:categoryId/subcategories/:subCategoryId/items/:itemId',
  )
  async updateItem(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Param('categoryId') categoryId: string,
    @Param('subCategoryId') subCategoryId: string,
    @Param('itemId') itemId: string,
    @Body() itemData: any,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.updateItem(
      templateId,
      categoryId,
      subCategoryId,
      itemId,
      itemData,
    );
  }

  @Delete(
    'templates/:templateId/categories/:categoryId/subcategories/:subCategoryId/items/:itemId',
  )
  async deleteItem(
    @Req() req: RequestWithUser,
    @Param('templateId') templateId: string,
    @Param('categoryId') categoryId: string,
    @Param('subCategoryId') subCategoryId: string,
    @Param('itemId') itemId: string,
  ) {
    this.checkPentadbirRole(req);
    return this.pentadbirService.deleteItem(
      templateId,
      categoryId,
      subCategoryId,
      itemId,
    );
  }
}
