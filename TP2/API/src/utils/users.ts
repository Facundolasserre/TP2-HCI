import { User } from "../entities/user";

export function removeUserPrivateValues(user: User | null | undefined): void {
  if (!user) return;
  const u: any = user as any;
  delete u.password;
  delete u.deletedAt;
  delete u.isVerified;
}

export function removeUserForListShared(user: User | null | undefined): void {
  if (!user) return;
  const u: any = user as any;
  delete u.password;
  delete u.deletedAt;
  delete u.isVerified;
  delete u.metadata;
  delete u.updatedAt;
  delete u.createdAt;
}

export function getSanitizedUserObject(user: User): Partial<User> {
  if (!user) return {};
  const { password, deletedAt, ...rest } = (user as any);
  return rest;
}

