// reset-teacher-passwords.js
// JS version to reset passwords for demo teacher accounts.
// Usage: node reset-teacher-passwords.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb://localhost:27017/teacher_system';
const NEW_PASSWORD = 'Teacher@123';
const SALT_ROUNDS = 10;

const teacherEmails = [
  'ali.guru@app.local',
  'bala.guru@app.local',
  'chong.guru@app.local',
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const User = mongoose.connection.collection('users');
    const hashed = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);

    let updatedCount = 0;
    for (const email of teacherEmails) {
      const res = await User.updateOne({ email }, { $set: { password: hashed } });
      if (res.matchedCount === 0) {
        console.log(`⚠️  Not found: ${email}`);
      } else if (res.modifiedCount === 1) {
        updatedCount++;
        console.log(`✅ Updated password for ${email}`);
      } else {
        console.log(`ℹ️  Already had matching hash (no change): ${email}`);
      }
    }

    console.log(`\nSummary: ${updatedCount}/${teacherEmails.length} updated.`);
    console.log(`New password for all updated teachers: ${NEW_PASSWORD}`);

    const updatedUsers = await User.find({ email: { $in: teacherEmails } }).project({ email: 1, password: 1 }).toArray();
    console.log('\nVerification (truncated hashes):');
    updatedUsers.forEach(u => console.log(`  ${u.email}: ${(u.password || '').substring(0, 30)}...`));

    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
