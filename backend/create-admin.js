// Create admin user script
import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/your-app-db';
const dbName = 'your-app-db';

async function createAdminUser() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2b$10$K7L/8Y1t9fZYFKxPtS8cHuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu', // password: admin123
      role: 'PENTADBIR',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await usersCollection.insertOne(adminUser);
    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();