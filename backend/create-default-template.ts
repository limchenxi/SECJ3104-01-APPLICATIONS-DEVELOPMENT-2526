// create-default-template.ts
import { MongooseModule } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PentadbirService } from './src/pentadbir/pentadbir.service';
import { TemplateRubric, TemplateRubricSchema } from './src/pentadbir/template.schema';
import { UsersService } from './src/users/users.service';
import { User, UserSchema } from './src/users/schemas/user.schema';

@Module({
  imports: [
    // Use the same DB as the main app to avoid mismatch
    MongooseModule.forRoot('mongodb://localhost:27017/teacher_system'),
    MongooseModule.forFeature([
      { name: TemplateRubric.name, schema: TemplateRubricSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  providers: [PentadbirService, UsersService],
})
class TemplateCreationModule {}

async function createDefaultTemplate() {
  try {
    const app = await NestFactory.createApplicationContext(TemplateCreationModule);
    const pentadbirService = app.get(PentadbirService);

    console.log('Creating default cerapan template with standards 4.1-4.6...');

    const defaultTemplate = {
      name: "TAPAK STANDARD 4 PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc)",
      description: "Template standard penilaian cerapan untuk guru berdasarkan Standard Kualiti Pendidikan Malaysia (SKPM) 2.0",
      scaleSkor: 4,
      categories: [
        {
          id: "cat_41",
          code: "4.1",
          name: "GURU SEBAGAI PERANCANG",
          description: "Guru merancang pengajaran dan pembelajaran dengan berkesan",
          subCategories: [
            {
              id: "subcat_41a",
              code: "4.1.1",
              name: "Rancangan Pengajaran Harian (RPH)",
              description: "Guru menyediakan RPH yang komprehensif dan berkesan",
              items: [
                {
                  id: "item_41a1",
                  text: "Menyediakan RPH yang mengandungi objektif yang jelas dan dapat diukur",
                  maxScore: 4
                },
                {
                  id: "item_41a2", 
                  text: "Memilih strategi pengajaran yang sesuai dengan kandungan dan tahap murid",
                  maxScore: 4
                },
                {
                  id: "item_41a3",
                  text: "Merancang aktiviti yang memenuhi kepelbagaian gaya pembelajaran murid", 
                  maxScore: 4
                }
              ]
            },
            {
              id: "subcat_41b",
              code: "4.1.2", 
              name: "Penyesuaian Pengajaran",
              description: "Guru menyesuaikan pengajaran mengikut keperluan murid",
              items: [
                {
                  id: "item_41b1",
                  text: "Menyesuaikan RPH berdasarkan pencapaian dan keperluan murid",
                  maxScore: 4
                },
                {
                  id: "item_41b2",
                  text: "Merancang aktivti tambahan untuk murid yang memerlukan sokongan",
                  maxScore: 4
                }
              ]
            }
          ]
        },
        {
          id: "cat_42",
          code: "4.2", 
          name: "GURU SEBAGAI FASILITATOR",
          description: "Guru memfasilitasi pengajaran dan pembelajaran dengan berkesan",
          subCategories: [
            {
              id: "subcat_42a",
              code: "4.2.1",
              name: "Pelaksanaan Pengajaran",
              description: "Guru melaksanakan pengajaran mengikut rancangan yang ditetapkan",
              items: [
                {
                  id: "item_42a1",
                  text: "Melaksanakan pengajaran mengikut urutan yang logik dan sistematik",
                  maxScore: 4
                },
                {
                  id: "item_42a2",
                  text: "Menggunakan bahasa yang jelas dan mudah difahami oleh murid",
                  maxScore: 4
                },
                {
                  id: "item_42a3", 
                  text: "Menguruskan masa pengajaran dengan berkesan",
                  maxScore: 4
                }
              ]
            },
            {
              id: "subcat_42b",
              code: "4.2.2",
              name: "Kaedah Pengajaran",
              description: "Guru menggunakan pelbagai kaedah pengajaran yang berkesan",
              items: [
                {
                  id: "item_42b1",
                  text: "Menggunakan kaedah pengajaran yang berpusatkan murid",
                  maxScore: 4
                },
                {
                  id: "item_42b2",
                  text: "Mengintegrasikan teknologi dalam pengajaran dengan berkesan", 
                  maxScore: 4
                }
              ]
            }
          ]
        },
        {
          id: "cat_43",
          code: "4.3",
          name: "GURU SEBAGAI PENILAI",
          description: "Guru menjalankan penilaian dengan adil dan berkesan",
          subCategories: [
            {
              id: "subcat_43a", 
              code: "4.3.1",
              name: "Penilaian Formatif",
              description: "Guru menjalankan penilaian semasa proses pembelajaran",
              items: [
                {
                  id: "item_43a1",
                  text: "Menggunakan pelbagai teknik penilaian formatif semasa pembelajaran",
                  maxScore: 4
                },
                {
                  id: "item_43a2",
                  text: "Memberikan maklum balas yang konstruktif kepada murid",
                  maxScore: 4
                }
              ]
            },
            {
              id: "subcat_43b",
              code: "4.3.2", 
              name: "Penilaian Sumatif",
              description: "Guru menjalankan penilaian pada akhir pembelajaran",
              items: [
                {
                  id: "item_43b1",
                  text: "Menyediakan instrumen penilaian yang sesuai dengan objektif pembelajaran",
                  maxScore: 4
                },
                {
                  id: "item_43b2",
                  text: "Menganalisis hasil penilaian untuk mengenal pasti pencapaian murid",
                  maxScore: 4
                }
              ]
            }
          ]
        },
        {
          id: "cat_44",
          code: "4.4",
          name: "GURU SEBAGAI MOTIVATOR",
          description: "Guru memotivasikan murid dalam pembelajaran",
          subCategories: [
            {
              id: "subcat_44a",
              code: "4.4.1",
              name: "Galakan dan Dorongan",
              description: "Guru memberikan galakan dan dorongan kepada murid",
              items: [
                {
                  id: "item_44a1", 
                  text: "Memberikan pujian dan galakan yang bermakna kepada murid",
                  maxScore: 4
                },
                {
                  id: "item_44a2",
                  text: "Mewujudkan suasana pembelajaran yang positif dan menyokong",
                  maxScore: 4
                }
              ]
            },
            {
              id: "subcat_44b",
              code: "4.4.2",
              name: "Penglibatan Murid", 
              description: "Guru melibatkan murid secara aktif dalam pembelajaran",
              items: [
                {
                  id: "item_44b1",
                  text: "Menggalakkan penyertaan aktif semua murid dalam aktiviti pembelajaran",
                  maxScore: 4
                },
                {
                  id: "item_44b2",
                  text: "Mewujudkan peluang untuk murid berkongsi idea dan pendapat",
                  maxScore: 4
                }
              ]
            }
          ]
        },
        {
          id: "cat_45",
          code: "4.5",
          name: "GURU SEBAGAI PEMIMPIN",
          description: "Guru menunjukkan kepimpinan dalam pengurusan bilik darjah",
          subCategories: [
            {
              id: "subcat_45a",
              code: "4.5.1", 
              name: "Pengurusan Bilik Darjah",
              description: "Guru menguruskan bilik darjah dengan berkesan",
              items: [
                {
                  id: "item_45a1",
                  text: "Menguruskan tingkah laku murid dengan berkesan",
                  maxScore: 4
                },
                {
                  id: "item_45a2",
                  text: "Mewujudkan persekitaran pembelajaran yang selamat dan kondusif",
                  maxScore: 4
                }
              ]
            },
            {
              id: "subcat_45b",
              code: "4.5.2",
              name: "Kepimpinan Instruksional",
              description: "Guru menunjukkan kepimpinan dalam pengajaran",
              items: [
                {
                  id: "item_45b1",
                  text: "Mengambil inisiatif untuk meningkatkan kualiti pengajaran",
                  maxScore: 4
                },
                {
                  id: "item_45b2",
                  text: "Menjadi contoh teladan kepada murid dalam nilai dan etika",
                  maxScore: 4
                }
              ]
            }
          ]
        },
        {
          id: "cat_46",
          code: "4.6",
          name: "GURU SEBAGAI PROFESIONAL",
          description: "Guru menjalankan tugas secara profesional",
          subCategories: [
            {
              id: "subcat_46a",
              code: "4.6.1",
              name: "Profesionalisme",
              description: "Guru menunjukkan sikap dan tingkah laku yang profesional",
              items: [
                {
                  id: "item_46a1",
                  text: "Menunjukkan komitmen dan tanggungjawab yang tinggi",
                  maxScore: 4
                },
                {
                  id: "item_46a2",
                  text: "Mematuhi kod etika dan standard profesional keguruan",
                  maxScore: 4
                }
              ]
            },
            {
              id: "subcat_46b", 
              code: "4.6.2",
              name: "Pembangunan Profesional",
              description: "Guru terlibat dalam pembangunan profesional berterusan",
              items: [
                {
                  id: "item_46b1",
                  text: "Mengambil bahagian dalam program pembangunan profesional",
                  maxScore: 4
                },
                {
                  id: "item_46b2",
                  text: "Melakukan refleksi dan penambahbaikan berterusan terhadap pengajaran",
                  maxScore: 4
                }
              ]
            }
          ]
        }
      ]
    };

    const template = await pentadbirService.createTemplate(defaultTemplate);
    
    console.log('✅ Default cerapan template created successfully!');
    console.log(`📋 Template ID: ${template._id}`);
    console.log(`📝 Template Name: ${template.name}`);
    console.log(`📊 Total Categories: ${template.categories.length}`);
    
    // Count total items
    let totalItems = 0;
    template.categories.forEach(cat => {
      cat.subCategories.forEach(sub => {
        totalItems += sub.items.length;
      });
    });
    console.log(`📑 Total Assessment Items: ${totalItems}`);
    
    await app.close();
  } catch (error) {
    console.error('❌ Error creating default template:', error.message);
  }
}

createDefaultTemplate();