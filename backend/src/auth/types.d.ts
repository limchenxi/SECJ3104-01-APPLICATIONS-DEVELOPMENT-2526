import { Request } from 'express';
import { User } from 'src/users/schemas/user.schema';

declare global {
  type RequestWithUser = Omit<Request, 'user'> & {
    user: User;
  };
}
