import { BadRequestException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 8;

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hash = await bcryptjs.hash(
      password,
      bcryptjs.genSaltSync(SALT_ROUNDS),
    );
    return hash;
  } catch (err) {
    throw new BadRequestException(err.message);
  }
};

export const verifyPassword = async (
  rawPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcryptjs.compare(rawPassword, hashedPassword);
  } catch (e: unknown) {
    const err = e as Error;
    throw new BadRequestException(err.message);
  }
};
