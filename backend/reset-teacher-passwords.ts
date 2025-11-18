// reset-teacher-passwords.ts
// Utility script to reset passwords for demo teacher accounts.
// New password applied: Teacher@123
// Usage (from backend folder):
//   node reset-teacher-passwords.ts

import { connect, connection } from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGO_URI = 'mongodb://localhost:27017/teacher_system';
const NEW_PASSWORD = 'Teacher@123';
const SALT_ROUNDS = 10;

// List of teacher emails to reset (adjust if needed)
const teacherEmails = [
  'ali.guru@app.local',
  'bala.guru@app.local',
  'chong.guru@app.local',
];

async function resetPasswords() {
  try {
    await connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const User = connection.collection('users');
    const hashed = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);

    let updatedCount = 0;
    for (const email of teacherEmails) {
      const res = await User.updateOne({ email }, { $set: { password: hashed } });
      if (res.matchedCount === 0) {
        console.log(`⚠️  No teacher found with email: ${email}`);
      } else if (res.modifiedCount === 1) {
        updatedCount++;
        console.log(`✅ Password reset for: ${email}`);
      } else {
        console.log(`ℹ️  Password already set (no modification): ${email}`);
      }
    }

    console.log(`\nSummary: ${updatedCount} of ${teacherEmails.length} teacher accounts updated.`);
    console.log(`New plaintext password for all updated teachers: ${NEW_PASSWORD}`);

    // Show truncated hashes for verification
    const updatedUsers = await User.find({ email: { $in: teacherEmails } }).project({ email: 1, password: 1 }).toArray();
    console.log('\nVerification (truncated hashes):');
    updatedUsers.forEach(u => {
      console.log(`  ${u.email}: ${(u.password || '').substring(0, 30)}...`);
    });

    await connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting passwords:', err);
    process.exit(1);
  }
}

resetPasswords();
