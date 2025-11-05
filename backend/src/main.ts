import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';

const ensureAdminUser = async (usersService: UsersService) => {
  const userCount = await usersService.countUsers();
  if (userCount > 0) {
    return;
  }

  const name = process.env.DEFAULT_ADMIN_NAME ?? 'System Admin';
  const email = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@app.local';
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin@123456';
  const role = 'DEVELOPER' as const;
  const ic = process.env.DEFAULT_ADMIN_IC ?? '000000000000';
  const genderEnv = process.env.DEFAULT_ADMIN_GENDER?.toLowerCase();
  const gender =
    genderEnv === 'female' ? 'Female' : genderEnv === 'male' ? 'Male' : 'Male';
  const contactNumber = process.env.DEFAULT_ADMIN_CONTACT_NUMBER;
  const profilePicture = process.env.DEFAULT_ADMIN_PROFILE_PICTURE;

  await usersService.createUser({
    name,
    email,
    password,
    role,
    ic,
    gender,
    contactNumber,
    profilePicture,
  });

  Logger.log(
    `Default admin user created with email ${email}. Please update the password immediately.`,
    'Bootstrap',
  );
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const usersService = app.get(UsersService);
  await ensureAdminUser(usersService);
  const port = process.env.PORT ?? 3000;
  app.enableCors();
  await app.listen(port);
  Logger.log(`App running on port ${port}`);
}
bootstrap();
