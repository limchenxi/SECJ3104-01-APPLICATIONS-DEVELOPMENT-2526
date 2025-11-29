// create-admin-user.ts
import { MongooseModule } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { UsersService } from './src/users/users.service';
import { User, UserSchema } from './src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/your-app-db'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
})
class AdminCreationModule {}

async function createAdminUser() {
  try {
    const app = await NestFactory.createApplicationContext(AdminCreationModule);
    const usersService = app.get(UsersService);

    console.log('Creating admin user...');

    const adminUser = await usersService.createUser({
      name: 'Administrator',
      email: 'admin@pentadbir.edu.my',
      password: 'admin123',
      ic: '123456789012',
      gender: 'Male',
      role: 'PENTADBIR',
      contactNumber: '0123456789',
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@pentadbir.edu.my');
    console.log('🔒 Password: admin123');
    console.log('👤 Role: PENTADBIR');

    await app.close();
  } catch (error) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@pentadbir.edu.my');
      console.log('🔒 Password: admin123');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  }
}

createAdminUser();
