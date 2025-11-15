// connect to database and update class assignments 
import { connect, connection } from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/cerapan_guru';

async function updateTeacherAssignments() {
  try {
    await connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const User = connection.collection('users');

    // Update Cikgu Ahmad Abdullah 
    const result = await User.updateOne(
      { name: 'Cikgu Ahmad Abdullah' }, 
      {
        $set: {
          subjects: ['Matematik', 'Sains', 'Bahasa Melayu'],
          classes: ['5 Amanah', '5 Bestari', '6 Cerdik'],
        },
      },
    );

    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      console.log('⚠️  No user found with name "Cikgu Ahmad Abdullah"');
      console.log('Listing all GURU users:');
      const teachers = await User.find({ role: 'GURU' }).toArray();
      teachers.forEach((t: any) => {
        console.log(`  - ${t.name} (${t.email})`);
      });
    } else {
      console.log('✅ Successfully updated teacher assignments!');
    }

    await connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateTeacherAssignments();
