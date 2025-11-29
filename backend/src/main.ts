import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { PentadbirService } from './pentadbir/pentadbir.service';
import * as dotenv from 'dotenv';
dotenv.config();

const ensureAdminUser = async (usersService: UsersService) => {
  const guruEmail = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@app.local';
  const existingGuru = await usersService.findByEmail(guruEmail);
  if (!existingGuru) {
    const name = process.env.DEFAULT_ADMIN_NAME ?? 'System Admin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin@123456';
    const role = 'GURU' as const; // Ensure role matches expected "guru" login
    const ic = process.env.DEFAULT_ADMIN_IC ?? '000000000000';
    const genderEnv = process.env.DEFAULT_ADMIN_GENDER?.toLowerCase();
    const gender =
      genderEnv === 'female'
        ? 'Female'
        : genderEnv === 'male'
          ? 'Male'
          : 'Male';
    const contactNumber = process.env.DEFAULT_ADMIN_CONTACT_NUMBER;
    const profilePicture = process.env.DEFAULT_ADMIN_PROFILE_PICTURE;

    await usersService.createUser({
      name,
      email: guruEmail,
      password,
      role,
      ic,
      gender,
      contactNumber,
      profilePicture,
      // subjects: ['Matematik', 'Bahasa Melayu'],
      // classes: ['5 Amanah', '5 Bestari'],
    });
    Logger.log(`Default GURU user ensured: ${guruEmail}`, 'Bootstrap');
  }
  // If guru exists but no assignments, optionally patch them (idempotent)
  // else if (!existingGuru.subjects || existingGuru.subjects.length === 0) {
  //   existingGuru.subjects = ['Matematik', 'Bahasa Melayu'];
  //   existingGuru.classes = ['5 Amanah', '5 Bestari'];
  //   await existingGuru.save();
  //   Logger.log(`Default GURU assignments patched`, 'Bootstrap');
  // }

  // Default PENTADBIR user
  const pentadbirEmail = 'pentadbir@app.local';
  const existingPentadbir = await usersService.findByEmail(pentadbirEmail);
  if (!existingPentadbir) {
    await usersService.createUser({
      name: 'Pentadbir Admin',
      email: pentadbirEmail,
      password: 'Pentadbir@123',
      role: 'PENTADBIR',
      ic: '111111111111',
      gender: 'Male',
      contactNumber: '0123456789',
    });
    Logger.log(
      `Default PENTADBIR user ensured: ${pentadbirEmail}`,
      'Bootstrap',
    );
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const usersService = app.get(UsersService);
  await ensureAdminUser(usersService);
  const pentadbirService = app.get(PentadbirService);
  await pentadbirService.ensureDefaultTapakTemplate();
  const port = process.env.PORT ?? 3000;
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"], // add your frontend URLs here
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  });
  await app.listen(port);
  Logger.log(`App running on port ${port}`);
}
bootstrap();
