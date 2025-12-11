import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School, SchoolDocument } from './schemas/school.schema';
import { UpdateSchoolDTO } from './dto/update-school.dto';

const SETTINGS_ID = 'SCHOOL_SETTINGS_ID';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
  ) {}

  async getSettings(): Promise<School> {
    const settings = await this.schoolModel.findOne({ id: SETTINGS_ID }).exec();

    if (!settings) {
      console.log('School settings not found, creating default settings...');
      const defaultSettings = new this.schoolModel();
      return defaultSettings.save();
    }
    return settings;
  }
  async updateSettings(updateSchoolDto: UpdateSchoolDTO): Promise<School> {
    const updatePayload = {};
    for (const key in updateSchoolDto) {
      if (
        Object.prototype.hasOwnProperty.call(updateSchoolDto, key) &&
        updateSchoolDto[key] !== undefined
      ) {
        for (const subKey in updateSchoolDto[key]) {
          updatePayload[`${key}.${subKey}`] = updateSchoolDto[key][subKey];
        }
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return this.getSettings();
    }

    const updatedSettings = await this.schoolModel
      .findOneAndUpdate(
        { id: SETTINGS_ID },
        { $set: updatePayload, updatedAt: new Date() },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();

    if (!updatedSettings) {
      throw new NotFoundException(
        'School settings document could not be found or updated.',
      );
    }

    return updatedSettings;
  }
}
