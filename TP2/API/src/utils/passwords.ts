import * as bycrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export function getHashedPassword(plainPassword: string): string {
  const salt = bycrypt.genSaltSync(SALT_ROUNDS);
  return bycrypt.hashSync(plainPassword, salt);
}

export function isValidPassword(plainPassword: string, hashedPassword: string): boolean {
  return bycrypt.compareSync(plainPassword, hashedPassword);
}