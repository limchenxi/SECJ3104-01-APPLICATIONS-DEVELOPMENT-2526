import * as mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import { Cerapan, CerapanSchema } from './src/cerapan/cerapan.schema';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/teacher_system');
  const CerapanModel = mongoose.model('Cerapan', CerapanSchema);

  const workbook = XLSX.readFile('samplecerapan.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  const formatted = data.map((row: any) => ({
    domain: row['Domain'] || row['domain'],
    indicator: row['Indicator'] || row['indicator'],
    scale: row['Scale'] || row['Skala'] || '',
  }));

  await CerapanModel.insertMany(formatted);
  console.log('✅ Imported', formatted.length, 'records');
  await mongoose.disconnect();
}

run().catch(console.error);
