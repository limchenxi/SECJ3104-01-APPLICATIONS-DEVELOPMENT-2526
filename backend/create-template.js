// Run this script with: node create-template.js
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/teacher_system');

// Define the Question Template Schema
const questionTemplateSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [{
    id: String,
    text: String,
    category: String,
    maxScore: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

const QuestionTemplate = mongoose.model('QuestionTemplate', questionTemplateSchema, 'questiontemplates');

const template = {
  title: "TAPAK STANDARD 4 PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc)",
  description: "Senarai Soalan Pencerapan PdPc - Digunakan untuk Kendiri, P1, dan P2",
  questions: [
    // Aspek 4.1: GURU SEBAGAI PERANCANG
    {
      id: "4.1.1a",
      text: "Menyediakan RPH yang mengandungi objektif yang boleh diukur dan aktiviti pembelajaran yang sesuai",
      category: "4.1 GURU SEBAGAI PERANCANG",
      maxScore: 4
    },
    {
      id: "4.1.1b",
      text: "Menentukan kaedah pentaksiran",
      category: "4.1 GURU SEBAGAI PERANCANG",
      maxScore: 4
    },
    {
      id: "4.1.1c",
      text: "Menyediakan ABM/BBM/BBB/TMK",
      category: "4.1 GURU SEBAGAI PERANCANG",
      maxScore: 4
    },
    
    // Aspek 4.2: GURU SEBAGAI PENGAWAL
    {
      id: "4.2.1a",
      text: "Mengelola isi pelajaran/skop pembelajaran yang dirancang",
      category: "4.2 GURU SEBAGAI PENGAWAL",
      maxScore: 4
    },
    {
      id: "4.2.1b",
      text: "Mengelola masa PdPc selaras dengan aktiviti pembelajaran",
      category: "4.2 GURU SEBAGAI PENGAWAL",
      maxScore: 4
    },
    {
      id: "4.2.1c",
      text: "Memberi peluang kepada penyertaan aktif murid",
      category: "4.2 GURU SEBAGAI PENGAWAL",
      maxScore: 4
    },
    {
      id: "4.2.2a",
      text: "Mengawasi komunikasi murid dalam PdPc",
      category: "4.2 GURU SEBAGAI PENGAWAL",
      maxScore: 4
    },
    {
      id: "4.2.2b",
      text: "Mengawasi perlakuan murid dalam PdPc",
      category: "4.2 GURU SEBAGAI PENGAWAL",
      maxScore: 4
    },
    {
      id: "4.2.2c",
      text: "Menyusun atur kedudukan murid",
      category: "4.2 GURU SEBAGAI PENGAWAL",
      maxScore: 4
    },
    {
      id: "4.2.2d",
      text: "Melaksanakan aktiviti pembelajaran yang menyeronokkan",
      category: "4.2 GURU SEBAGAI PENGAWAL",
      maxScore: 4
    },
    
    // Aspek 4.3: GURU SEBAGAI PEMBIMBING
    {
      id: "4.3.1a",
      text: "Memberi tunjuk ajar/tunjuk cara/panduan menguasai isi pelajaran/konsep/fakta berkaitan pelajaran",
      category: "4.3 GURU SEBAGAI PEMBIMBING",
      maxScore: 4
    },
    {
      id: "4.3.1b",
      text: "Memberi tunjuk ajar/tunjuk cara/panduan menguasai kemahiran dalam aktiviti pembelajaran",
      category: "4.3 GURU SEBAGAI PEMBIMBING",
      maxScore: 4
    },
    {
      id: "4.3.1c",
      text: "Memandu murid membuat keputusan dan menyelesaikan masalah dalam aktiviti pembelajaran",
      category: "4.3 GURU SEBAGAI PEMBIMBING",
      maxScore: 4
    },
    {
      id: "4.3.1d",
      text: "Memandu murid menggunakan/memanfaatkan sumber pendidikan berkaitan pelajaran",
      category: "4.3 GURU SEBAGAI PEMBIMBING",
      maxScore: 4
    },
    {
      id: "4.3.1e",
      text: "Menggabung/merentas/membuat perkaitan isi pelajaran dengan tajuk/unit/tema/kemahiran/mata pelajaran lain dalam aktiviti pembelajaran",
      category: "4.3 GURU SEBAGAI PEMBIMBING",
      maxScore: 4
    },
    
    // Aspek 4.4: GURU SEBAGAI PENDORONG
    {
      id: "4.4.1a",
      text: "Merangsang murid berkomunikasi",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.1b",
      text: "Merangsang murid berkolaboratif dalam aktiviti pembelajaran",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.1c",
      text: "Mengemukakan soalan yang menjurus kepada pemikiran kritis dan kreatif",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.1d",
      text: "Mengajukan soalan/mewujudkan situasi yang menjurus ke arah membuat keputusan dan penyelesaian masalah",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.1e",
      text: "Mewujudkan peluang untuk murid memimpin",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.1f",
      text: "Menggalakkan murid mengemukakan soalan berkaitan isi pelajaran",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.1g",
      text: "Menggalakkan murid memperoleh pengetahuan dan kemahiran secara kendiri",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.2a",
      text: "Memberi pujian/galakan terhadap perlakuan positif",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.2b",
      text: "Memberi penghargaan terhadap hasil kerja/idea yang bernas",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.2c",
      text: "Memberi keyakinan dalam mengemukakan soalan/memberi respons",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    {
      id: "4.4.2d",
      text: "Prihatin terhadap keperluan murid",
      category: "4.4 GURU SEBAGAI PENDORONG",
      maxScore: 4
    },
    
    // Aspek 4.5: GURU SEBAGAI PENILAI
    {
      id: "4.5.1a",
      text: "Menggunakan pelbagai kaedah pentaksiran dalam PdPc",
      category: "4.5 GURU SEBAGAI PENILAI",
      maxScore: 4
    },
    {
      id: "4.5.1b",
      text: "Menjalankan aktiviti pemulihan/pengayaan dalam PdPc",
      category: "4.5 GURU SEBAGAI PENILAI",
      maxScore: 4
    },
    {
      id: "4.5.1c",
      text: "Memberi latihan/tugasan berkaitan pelajaran",
      category: "4.5 GURU SEBAGAI PENILAI",
      maxScore: 4
    },
    {
      id: "4.5.1d",
      text: "Membuat refleksi PdPc",
      category: "4.5 GURU SEBAGAI PENILAI",
      maxScore: 4
    },
    {
      id: "4.5.1e",
      text: "Menyemak/menilai hasil kerja/gerak kerja/latihan/tugasan",
      category: "4.5 GURU SEBAGAI PENILAI",
      maxScore: 4
    },
    
    // Aspek 4.6: MURID SEBAGAI PEMBELAJAR AKTIF
    {
      id: "4.6.1a",
      text: "Memberi respons berkaitan isi pelajaran",
      category: "4.6 MURID SEBAGAI PEMBELAJAR AKTIF",
      maxScore: 4
    },
    {
      id: "4.6.1b",
      text: "Berkomunikasi dalam melaksanakan aktiviti pembelajaran",
      category: "4.6 MURID SEBAGAI PEMBELAJAR AKTIF",
      maxScore: 4
    },
    {
      id: "4.6.1c",
      text: "Melaksanakan aktiviti pembelajaran secara kolaboratif",
      category: "4.6 MURID SEBAGAI PEMBELAJAR AKTIF",
      maxScore: 4
    },
    {
      id: "4.6.1d",
      text: "Memberi respons yang menjurus ke arah pemikiran kritis dan kreatif berkaitan isi pelajaran",
      category: "4.6 MURID SEBAGAI PEMBELAJAR AKTIF",
      maxScore: 4
    },
    {
      id: "4.6.1e",
      text: "Mengemukakan soalan berkaitan isi pelajaran",
      category: "4.6 MURID SEBAGAI PEMBELAJAR AKTIF",
      maxScore: 4
    },
    {
      id: "4.6.1f",
      text: "Menguasai pengetahuan dan kemahiran yang dipelajari",
      category: "4.6 MURID SEBAGAI PEMBELAJAR AKTIF",
      maxScore: 4
    },
    {
      id: "4.6.1g",
      text: "Membuat keputusan menyelesaikan masalah berkaitan aktiviti pembelajaran",
      category: "4.6 MURID SEBAGAI PEMBELAJAR AKTIF",
      maxScore: 4
    }
  ]
};

async function createTemplate() {
  try {
    // Check if template already exists
    const existing = await QuestionTemplate.findOne({ title: template.title });
    
    if (existing) {
      console.log('Template already exists with ID:', existing._id.toString());
      console.log('\nUpdate TeacherCerapanKendiri.tsx with this template ID!');
      mongoose.connection.close();
      return;
    }

    // Create new template
    const result = await QuestionTemplate.create(template);
    console.log('✅ Template created successfully!');
    console.log('Template ID:', result._id.toString());
    console.log('Total questions:', result.questions.length);
    console.log('\n📋 Categories:');
    
    const categories = [...new Set(result.questions.map(q => q.category))];
    categories.forEach(cat => {
      const count = result.questions.filter(q => q.category === cat).length;
      console.log(`  - ${cat}: ${count} questions`);
    });
    
    console.log('\n⚠️ IMPORTANT: Update the frontend file!');
    console.log(`Copy this template ID: ${result._id.toString()}`);
    console.log('Replace the fake ID in: frontend/src/features/Cerapan/pages/TeacherCerapanKendiri.tsx');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating template:', error);
    mongoose.connection.close();
  }
}

createTemplate();
