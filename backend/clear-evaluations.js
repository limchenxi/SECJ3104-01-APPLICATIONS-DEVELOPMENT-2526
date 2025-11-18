const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_system';

async function clearEvaluations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Count records before deletion in cerapans collection
    const countBefore = await db.collection('cerapans').countDocuments();
    console.log(`Found ${countBefore} cerapan records`);

    // Delete all records from cerapans collection
    const result = await db.collection('cerapans').deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} cerapan records`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error clearing cerapans:', error);
    process.exit(1);
  }
}

clearEvaluations();
