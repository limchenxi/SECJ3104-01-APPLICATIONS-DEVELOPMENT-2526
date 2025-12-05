import { Request } from 'express';
import { Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

declare global {
  type RequestWithUser = Omit<Request, 'user'> & {
    user: User & { _id: Types.ObjectId };
  };
}
