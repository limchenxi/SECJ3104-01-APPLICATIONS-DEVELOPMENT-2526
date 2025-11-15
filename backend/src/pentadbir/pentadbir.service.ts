// CLEAN REBUILD OF SERVICE DUE TO PREVIOUS CORRUPTION
// Clean rebuilt PentadbirService (corrupted fragments removed)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { TemplateRubric } from './template.schema';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class PentadbirService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(TemplateRubric.name) private readonly templateModel: Model<TemplateRubric>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.usersService.countUsers();
    return { totalUsers, totalTeachers: 0, totalCerapan: 0, pendingReviews: 0 };
  }

  async getKedatanganStats() {
    const totalUsers = await this.usersService.countUsers();
    return { totalTeachers: totalUsers, presentToday: 0, lateToday: 0, absentToday: 0, attendanceRate: 0 };
  }

  async getCerapanOverview() { return { totalCerapan: 0, completed: 0, pending: 0 }; }

  async getAllTemplates(): Promise<TemplateRubric[]> { return this.templateModel.find().sort({ updatedAt: -1 }); }

  async ensureDefaultTapakTemplate(): Promise<void> {
    const name = 'TAPAK STANDARD 4 PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc)';
    const versionTag = 'versi-2025-11-15';
    const existing = await this.templateModel.findOne({ name });
    if (existing && existing.description?.includes(versionTag)) return;

    const pattern4 = [
      { score: 4, label: 'Cemerlang', description: 'Memenuhi semua empat (4) kriteria yang ditetapkan' },
      { score: 3, label: 'Baik', description: 'Mengambil kira mana-mana tiga (3) perkara' },
      { score: 2, label: 'Sederhana', description: 'Mengambil kira mana-mana dua (2) perkara' },
      { score: 1, label: 'Lemah', description: 'Mengambil kira mana-mana satu (1) perkara' },
      { score: 0, label: 'Tidak Memuaskan', description: 'Tidak mengambil kira mana-mana perkara' },
    ];
    const patternObj = [
      { score: 4, label: 'Cemerlang', description: 'i. Berdasarkan objektif pelajaran\nii. Mengikut pelbagai aras keupayaan murid\iii. Dari semasa ke semasa' },
      { score: 3, label: 'Baik', description: 'Mengambil kira perkara (i) dan (ii) atau perkara (i) dan (iii)' },
      { score: 2, label: 'Sederhana', description: 'Mengambil kira perkara (ii) dan (iii)' },
      { score: 1, label: 'Lemah', description: 'Mengambil kira mana-mana satu (1) perkara' },
      { score: 0, label: 'Tidak Memuaskan', description: 'Tidak mengambil kira mana-mana perkara' },
    ];
    const patternBerhemah = [
      { score: 4, label: 'Cemerlang', description: 'i. Secara berhemah\nii. Secara menyeluruh meliputi semua murid\iii. Dari semasa ke semasa' },
      { score: 3, label: 'Baik', description: 'Mengambil kira perkara (i) dan (ii) atau perkara (i) dan (iii)' },
      { score: 2, label: 'Sederhana', description: 'Mengambil kira perkara (ii) dan (iii)' },
      { score: 1, label: 'Lemah', description: 'Mengambil kira mana-mana satu (1) perkara' },
      { score: 0, label: 'Tidak Memuaskan', description: 'Tidak mengambil kira mana-mana perkara' },
    ];
    const patternPerc90 = [
      { score: 4, label: 'Cemerlang', description: 'i. Pelibatan 90%-100% murid\nii. Selaras dengan objektif pelajaran\iii. Dengan yakin\iv. Secara berhemah/bersungguh-sungguh' },
      { score: 3, label: 'Baik', description: 'i. Pelibatan 80%-89% murid\nii. Memenuhi sekurang-kurangnya dua (2) perkara daripada (ii), (iii), (iv)' },
      { score: 2, label: 'Sederhana', description: 'i. Pelibatan 50%-79% murid\nii. Memenuhi sekurang-kurangnya satu (1) perkara daripada (ii), (iii), (iv)' },
      { score: 1, label: 'Lemah', description: 'i. Pelibatan 1%-49% murid\nii. Memenuhi sekurang-kurangnya satu (1) perkara daripada (ii), (iii), (iv)' },
      { score: 0, label: 'Tidak Memuaskan', description: 'Tidak memenuhi mana-mana perkara' },
    ];
    const patternPerc50 = [
      { score: 4, label: 'Cemerlang', description: 'i. Pelibatan 50%-100% murid\nii. Selaras dengan objektif pelajaran\iii. Dengan yakin\iv. Secara berhemah/bersungguh-sungguh' },
      { score: 3, label: 'Baik', description: 'Memenuhi sekurang-kurangnya dua (2) perkara daripada (ii), (iii), (iv)' },
      { score: 2, label: 'Sederhana', description: 'Memenuhi sekurang-kurangnya satu (1) perkara daripada (ii), (iii), (iv)' },
      { score: 1, label: 'Lemah', description: 'Tidak menunjukkan ciri-ciri perkara (ii), (iii), (iv)' },
      { score: 0, label: 'Tidak Memuaskan', description: 'Tidak memenuhi mana-mana perkara' },
    ];

    const templateData: any = {
      name,
      description: `Rubrik TAPAK Standard 4 (accurate) ${versionTag}`,
      scaleSkor: 4,
      categories: [
        { id: 'cat_41', code: '4.1', name: 'ASPEK 4.1: GURU SEBAGAI PERANCANG', description: 'Perancangan PdPc dan sokongan', subCategories: [ { id: 'subcat_4_1_1', code: '4.1.1', name: 'Perancangan PdPc', description: 'Objektif, pentaksiran, bahan', items: [ { id: 'item_4_1_1_a', text: 'Menyediakan RPH yang mengandungi objektif yang boleh diukur dan aktiviti pembelajaran yang sesuai', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_1_1_b', text: 'Menentukan kaedah pentaksiran', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_1_1_c', text: 'Menyediakan ABM/BBM/BBB/TMK', maxScore: 4, scoreDescriptions: patternObj } ] } ] },
        { id: 'cat_42', code: '4.2', name: 'ASPEK 4.2: GURU SEBAGAI PENGAWAL', description: 'Mengelola proses dan suasana PdPc', subCategories: [ { id: 'subcat_4_2_1', code: '4.2.1', name: 'Mengelola proses pembelajaran', description: 'Isi pelajaran, masa dan penyertaan aktif', items: [ { id: 'item_4_2_1_a', text: 'Mengelola isi pelajaran/skop pembelajaran yang dirancang', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_2_1_b', text: 'Mengelola masa PdPc selaras dengan aktiviti pembelajaran', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_2_1_c', text: 'Memberi peluang kepada penyertaan aktif murid', maxScore: 4, scoreDescriptions: patternObj } ] }, { id: 'subcat_4_2_2', code: '4.2.2', name: 'Mengelola suasana pembelajaran', description: 'Komunikasi, perlakuan, kedudukan, aktiviti menyeronokkan', items: [ { id: 'item_4_2_2_a', text: 'Mengawasi komunikasi murid dalam PdPc', maxScore: 4, scoreDescriptions: patternBerhemah }, { id: 'item_4_2_2_b', text: 'Mengawasi perlakuan murid dalam PdPc', maxScore: 4, scoreDescriptions: patternBerhemah }, { id: 'item_4_2_2_c', text: 'Menyusun atur kedudukan murid', maxScore: 4, scoreDescriptions: patternBerhemah }, { id: 'item_4_2_2_d', text: 'Melaksanakan aktiviti pembelajaran yang menyeronokkan', maxScore: 4, scoreDescriptions: patternBerhemah } ] } ] },
        { id: 'cat_43', code: '4.3', name: 'ASPEK 4.3: GURU SEBAGAI PEMBIMBING', description: 'Bimbingan isi, kemahiran, sumber & integrasi', subCategories: [ { id: 'subcat_4_3_1', code: '4.3.1', name: 'Bimbingan murid', description: 'Isi, kemahiran, keputusan, sumber, kaitan', items: [ { id: 'item_4_3_1_a', text: 'Memberi tunjuk ajar/tunjuk cara/panduan menguasai isi pelajaran, konsep, atau fakta', maxScore: 4, scoreDescriptions: pattern4 }, { id: 'item_4_3_1_b', text: 'Memberi tunjuk ajar/tunjuk cara/panduan menguasai kemahiran dalam aktiviti pembelajaran', maxScore: 4, scoreDescriptions: pattern4 }, { id: 'item_4_3_1_c', text: 'Memandu murid membuat keputusan dan menyelesaikan masalah dalam aktiviti pembelajaran', maxScore: 4, scoreDescriptions: pattern4 }, { id: 'item_4_3_1_d', text: 'Memandu murid menggunakan/memanfaatkan sumber pendidikan berkaitan pelajaran', maxScore: 4, scoreDescriptions: pattern4 }, { id: 'item_4_3_1_e', text: 'Menggabung/merentas/mengaitkan isi pelajaran dengan tajuk/unit/tema/nilai/kemahiran/mata pelajaran lain', maxScore: 4, scoreDescriptions: pattern4 } ] } ] },
        { id: 'cat_44', code: '4.4', name: 'ASPEK 4.4: GURU SEBAGAI PENDORONG', description: 'Merangsang komunikasi, kolaboratif, soalan, kepimpinan & emosi', subCategories: [ { id: 'subcat_4_4_1', code: '4.4.1', name: 'Mendorong minda & tindakan murid', description: 'Komunikasi, kolaboratif, pemikiran, keputusan, kepimpinan, soalan, kendiri', items: [ { id: 'item_4_4_1_a', text: 'Merangsang murid berkomunikasi', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_4_1_b', text: 'Merangsang murid berkolaboratif dalam aktiviti pembelajaran', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_4_1_c', text: 'Mengemukakan soalan yang menjurus ke arah pemikiran kritis dan kreatif', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_4_1_d', text: 'Mengajukan soalan/mewujudkan situasi yang menjurus ke arah membuat keputusan dan menyelesaikan masalah', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_4_1_e', text: 'Mewujudkan peluang untuk murid memimpin', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_4_1_f', text: 'Menggalakkan murid mengemukakan soalan berkaitan isi pelajaran', maxScore: 4, scoreDescriptions: patternObj }, { id: 'item_4_4_1_g', text: 'Menggalakkan murid memperoleh pengetahuan dan kemahiran secara kendiri', maxScore: 4, scoreDescriptions: patternObj } ] }, { id: 'subcat_4_4_2', code: '4.4.2', name: 'Mendorong emosi murid', description: 'Pujian, penghargaan, keyakinan, keprihatinan', items: [ { id: 'item_4_4_2_a', text: 'Memberi pujian/galakan terhadap perlakuan positif', maxScore: 4, scoreDescriptions: patternBerhemah }, { id: 'item_4_4_2_b', text: 'Memberi penghargaan terhadap hasil kerja/idea yang bernas', maxScore: 4, scoreDescriptions: patternBerhemah }, { id: 'item_4_4_2_c', text: 'Memberi keyakinan dalam mengemukakan soalan/memberi respons', maxScore: 4, scoreDescriptions: patternBerhemah }, { id: 'item_4_4_2_d', text: 'Prihatin terhadap keperluan murid', maxScore: 4, scoreDescriptions: patternBerhemah } ] } ] },
        { id: 'cat_45', code: '4.5', name: 'ASPEK 4.5: GURU SEBAGAI PENILAI', description: 'Pelaksanaan pelbagai kaedah pentaksiran dan refleksi', subCategories: [ { id: 'subcat_4_5_1', code: '4.5.1', name: 'Pelaksanaan pentaksiran', description: 'Pelbagai kaedah, pemulihan, latihan, refleksi, semakan', items: [ { id: 'item_4_5_1_a', text: 'Menggunakan pelbagai kaedah pentaksiran dalam PdPc', maxScore: 4, scoreDescriptions: pattern4 }, { id: 'item_4_5_1_b', text: 'Menjalankan aktiviti pemulihan/pengayaan dalam PdPc', maxScore: 4, scoreDescriptions: pattern4 }, { id: 'item_4_5_1_c', text: 'Memberi latihan/tugasan berkaitan pelajaran', maxScore: 4, scoreDescriptions: pattern4 }, { id: 'item_4_5_1_d', text: 'Membuat refleksi PdPc', maxScore: 4, scoreDescriptions: pattern4 }, { id: 'item_4_5_1_e', text: 'Menyemak/menilai hasil kerja/gerak kerja/latihan/tugasan', maxScore: 4, scoreDescriptions: pattern4 } ] } ] },
        { id: 'cat_46', code: '4.6', name: 'ASPEK 4.6: MURID SEBAGAI PEMBELAJAR AKTIF', description: 'Respons, komunikasi, kolaboratif, pemikiran, soalan, kaitan, keputusan', subCategories: [ { id: 'subcat_4_6_1', code: '4.6.1', name: 'Penglibatan aktif murid', description: 'Pelibatan dan interaksi dalam PdPc', items: [ { id: 'item_4_6_1_a', text: 'Memberi respons berkaitan isi pelajaran', maxScore: 4, scoreDescriptions: patternPerc90 }, { id: 'item_4_6_1_b', text: 'Berkomunikasi dalam melaksanakan aktiviti pembelajaran', maxScore: 4, scoreDescriptions: patternPerc90 }, { id: 'item_4_6_1_c', text: 'Melaksanakan aktiviti pembelajaran secara kolaboratif', maxScore: 4, scoreDescriptions: patternPerc90 }, { id: 'item_4_6_1_d', text: 'Memberi respons ke arah pemikiran kritis dan kreatif', maxScore: 4, scoreDescriptions: patternPerc50 }, { id: 'item_4_6_1_e', text: 'Mengemukakan soalan berkaitan isi pelajaran', maxScore: 4, scoreDescriptions: patternPerc50 }, { id: 'item_4_6_1_f', text: 'Mengaitkan isi pelajaran dengan kehidupan murid/isu lokal/global', maxScore: 4, scoreDescriptions: patternPerc50 }, { id: 'item_4_6_1_g', text: 'Membuat keputusan dan menyelesaikan masalah berkaitan aktiviti pembelajaran', maxScore: 4, scoreDescriptions: patternPerc50 } ] } ] },
      ],
    };

    if (!existing) await this.createTemplate(templateData);
    else {
      existing.description = templateData.description;
      existing.categories = templateData.categories;
      existing.updatedAt = new Date();
      await existing.save();
    }
  }

  async getTemplateById(id: string): Promise<TemplateRubric> {
    const template = await this.templateModel.findById(id);
    if (!template) throw new NotFoundException(`Template with ID "${id}" not found`);
    return template;
  }

  async createTemplate(dto: CreateTemplateDto): Promise<TemplateRubric> {
    const template = new this.templateModel(dto);
    return template.save();
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<TemplateRubric> {
    const template = await this.templateModel.findByIdAndUpdate(id, { ...dto, updatedAt: new Date() }, { new: true });
    if (!template) throw new NotFoundException(`Template with ID "${id}" not found`);
    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    const res = await this.templateModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException(`Template with ID "${id}" not found`);
  }

  async addCategory(templateId: string, data: any): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    template.categories.push({ id: data.id || `cat_${Date.now()}`, code: data.code, name: data.name, description: data.description, subCategories: [] } as any);
    template.updatedAt = new Date();
    return template.save();
  }

  async updateCategory(templateId: string, categoryId: string, data: any): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    const idx = template.categories.findIndex(c => c.id === categoryId);
    if (idx === -1) throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    if (data.code !== undefined) template.categories[idx].code = data.code;
    if (data.name !== undefined) template.categories[idx].name = data.name;
    if (data.description !== undefined) template.categories[idx].description = data.description;
    template.updatedAt = new Date();
    return template.save();
  }

  async deleteCategory(templateId: string, categoryId: string): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    template.categories = template.categories.filter(c => c.id !== categoryId) as any;
    template.updatedAt = new Date();
    return template.save();
  }

  async addSubCategory(templateId: string, categoryId: string, data: any): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    const category = template.categories.find(c => c.id === categoryId);
    if (!category) throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    category.subCategories.push({ id: data.id || `subcat_${Date.now()}`, code: data.code, name: data.name, description: data.description, items: [] } as any);
    template.updatedAt = new Date();
    return template.save();
  }

  async updateSubCategory(templateId: string, categoryId: string, subCategoryId: string, data: any): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    const category = template.categories.find(c => c.id === categoryId);
    if (!category) throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    const idx = category.subCategories.findIndex(s => s.id === subCategoryId);
    if (idx === -1) throw new NotFoundException(`Sub-category with ID "${subCategoryId}" not found`);
    if (data.code !== undefined) category.subCategories[idx].code = data.code;
    if (data.name !== undefined) category.subCategories[idx].name = data.name;
    if (data.description !== undefined) category.subCategories[idx].description = data.description;
    template.updatedAt = new Date();
    return template.save();
  }

  async deleteSubCategory(templateId: string, categoryId: string, subCategoryId: string): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    const category = template.categories.find(c => c.id === categoryId);
    if (!category) throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    category.subCategories = category.subCategories.filter(s => s.id !== subCategoryId) as any;
    template.updatedAt = new Date();
    return template.save();
  }

  async addItem(templateId: string, categoryId: string, subCategoryId: string, data: any): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    const category = template.categories.find(c => c.id === categoryId);
    if (!category) throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    const sub = category.subCategories.find(s => s.id === subCategoryId);
    if (!sub) throw new NotFoundException(`Sub-category with ID "${subCategoryId}" not found`);
    sub.items.push({ id: data.id || `item_${Date.now()}`, text: data.text, maxScore: data.maxScore, scoreDescriptions: data.scoreDescriptions || [] } as any);
    template.updatedAt = new Date();
    return template.save();
  }

  async updateItem(templateId: string, categoryId: string, subCategoryId: string, itemId: string, data: any): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    const category = template.categories.find(c => c.id === categoryId);
    if (!category) throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    const sub = category.subCategories.find(s => s.id === subCategoryId);
    if (!sub) throw new NotFoundException(`Sub-category with ID "${subCategoryId}" not found`);
    const idx = sub.items.findIndex(i => i.id === itemId);
    if (idx === -1) throw new NotFoundException(`Item with ID "${itemId}" not found`);
    if (data.text !== undefined) sub.items[idx].text = data.text;
    if (data.maxScore !== undefined) sub.items[idx].maxScore = data.maxScore;
    if (data.scoreDescriptions !== undefined) sub.items[idx].scoreDescriptions = data.scoreDescriptions;
    template.updatedAt = new Date();
    return template.save();
  }

  async deleteItem(templateId: string, categoryId: string, subCategoryId: string, itemId: string): Promise<TemplateRubric> {
    const template = await this.getTemplateById(templateId);
    const category = template.categories.find(c => c.id === categoryId);
    if (!category) throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    const sub = category.subCategories.find(s => s.id === subCategoryId);
    if (!sub) throw new NotFoundException(`Sub-category with ID "${subCategoryId}" not found`);
    sub.items = sub.items.filter(i => i.id !== itemId) as any;
    template.updatedAt = new Date();
    return template.save();
  }
}
