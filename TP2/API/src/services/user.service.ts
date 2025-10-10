import AppDataSource from "../db";
import { User } from "../entities/user";
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError, handleCaughtError } from "../types/errors";
import { LoginUserData, PasswordResetData, RegisterUserData } from "../types/user";
import { getHashedPassword, isValidPassword } from "../utils/passwords";
import { validate } from "class-validator";
import * as jwt from "jsonwebtoken";
import { EmailType, Mailer } from "./email.service";
import { UserVerificationToken } from "../entities/userVerificationToken";
import { generateUserToken } from "../utils/tokens";
import { UserPasswordRecoveryToken } from "../entities/userPasswordRecoveryToken";
import { removeUserPrivateValues } from "../utils/users";
import { QueryFailedError } from "typeorm";
import { ERROR_MESSAGES } from '../types/errorMessages';

/**
 * Creates a new user and a verification token.
 * Runs inside a transaction to avoid race conditions.
 * Send a verification email after commit.
 *
 * @param {RegisterUserData} userData - Registration data (name, surname, email, password, metadata)
 * @param {Mailer} mailer - Mailer service to send the verification email
 * @returns {Promise<User>} Created user (without private fields)
 * @throws {BadRequestError} If validation fails or email already exists
 */
export async function createNewUser(
  userData: RegisterUserData,
  mailer: Mailer
): Promise<User> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const user = new User();
    user.name = userData.name;
    user.surname = userData.surname;
    user.email = userData.email;
    user.password = getHashedPassword(userData.password);
    user.metadata = userData.metadata;

    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestError(errors.map(e => Object.values(e.constraints || {}).join(", ")).join(", "));
    }

    await queryRunner.manager.save(user);

    const verificationToken = new UserVerificationToken();
    verificationToken.expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    verificationToken.token = generateUserToken();
    verificationToken.user = user;
    await queryRunner.manager.save(verificationToken);

    await queryRunner.commitTransaction();

    await mailer.sendEmail(EmailType.REGISTRATION, userData.name, verificationToken.token);

    removeUserPrivateValues(user);
    return user.getFormattedUser();
  } catch (err: any) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    
    if (err instanceof QueryFailedError && err.message.includes('UNIQUE constraint failed: user.email')) {
      throw new ConflictError(ERROR_MESSAGES.BUSINESS_RULE.EMAIL_ALREADY_EXISTS);
    }
    
    throw err;
  } finally {
    await queryRunner.release();
  }

}

/**
 * Retrieves a user profile by current user.
 *
 * @param {User} currentUser - Authenticated user object
 * @returns {Promise<User>} Public user profile
 * @throws {NotFoundError} If user is not found
 */
export async function getUserService(
  currentUser: User
): Promise<User> {
  try {
    if (!currentUser) {
      throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);
    }

    const user: User = await User.findOne({
      where: { id: currentUser.id }
    });
    if (!user) throw new NotFoundError();

    removeUserPrivateValues(user as any);
    return user.getFormattedUser ? user.getFormattedUser() : user;
  } catch (err: unknown) {
    handleCaughtError(err);
  }
}

/**
 * Authenticates a user and generates a JWT.
 *
 * @param {LoginUserData} userData - Login data (email and password)
 * @returns {Promise<string>} Signed JWT token valid for 30 days
 * @throws {NotFoundError} If user does not exist
 * @throws {BadRequestError} If password is invalid
 * @throws {UnauthorizedError} If user is not verified
 */
export async function createNewUserToken(userData: LoginUserData): Promise<string> {
  try {
    const user: User | null = await User.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: userData.email })
      .getOne();
    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    } else if (!isValidPassword(userData.password, user.password)) {
      throw new UnauthorizedError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    } else if (!user.isVerified) {
      throw new UnauthorizedError(ERROR_MESSAGES.AUTH.ACCOUNT_NOT_VERIFIED);
    } else {
      return jwt.sign({ sub: user.id, iat: Date.now() }, process.env.JWT_TOKEN, { expiresIn: "30d" });
    }
  } catch (err: unknown) {
    throw err;
  }
}

/**
 * Verifies a user's email with a token.
 * Runs inside a transaction to update the user and remove the token atomically.
 *
 * @param {string} token - Verification token sent to the user
 * @returns {Promise<User>} Verified user object with formatted output
 * @throws {BadRequestError} If token is invalid or expired
 * @throws {ConflictError} If account is already verified
 */
export async function verifyUser(token: string): Promise<User> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userVerificationToken: UserVerificationToken | null =
      await queryRunner.manager.findOne(UserVerificationToken, {
        where: { token },
        relations: ["user"]
      });

    if (!userVerificationToken) throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID("verification code"));

    const user: User = userVerificationToken.user;
    if (user.isVerified) throw new ConflictError(ERROR_MESSAGES.CONFLICT.ACCOUNT_ALREADY_VERIFIED);
    if (userVerificationToken.expirationDate < new Date()) throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID("verification code (expired)"));

    user.isVerified = true;
    await queryRunner.manager.save(user);
    await queryRunner.manager.remove(userVerificationToken);

    const savedUser = await queryRunner.manager.findOne(User, { where: { id: user.id } });
    if (!savedUser) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);

    await queryRunner.commitTransaction();

    removeUserPrivateValues(savedUser);
    return savedUser.getFormattedUser();
  } catch (err: unknown) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    throw err;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Generates a new password recovery token for a user.
 * Removes any old token before saving the new one.
 * Runs inside a transaction to avoid inconsistencies.
 *
 * @param {string} email - User email
 * @param {Mailer} mailer - Mailer service to send recovery email
 * @returns {Promise<boolean>} True if recovery email was sent successfully
 * @throws {NotFoundError} If user does not exist
 */
export async function sendPasswordRecoveryEmail(email: string, mailer: Mailer): Promise<boolean> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const user: User | null = await queryRunner.manager.findOne(User, {
      where: { email },
      relations: ["passwordRecoveryToken"]
    });

    if (!user) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);

    const oldToken = user.passwordRecoveryToken;
    if (oldToken) await queryRunner.manager.remove(oldToken);

    const newToken: UserPasswordRecoveryToken = new UserPasswordRecoveryToken();
    newToken.user = user;
    newToken.token = generateUserToken();
    newToken.expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await queryRunner.manager.save(newToken);
    await queryRunner.commitTransaction();

    await mailer.sendEmail(EmailType.RESET_PASSWORD, newToken.token, newToken.expirationDate);

    return true;
  } catch (err: unknown) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Resets a user's password using a recovery token.
 * Runs inside a transaction to update the password and remove the token atomically.
 *
 * @param {PasswordResetData} resetPasswordData - Contains reset token and new password
 * @returns {Promise<void>} 
 * @throws {NotFoundError} If token is invalid
 * @throws {BadRequestError} If token expired
 */
export async function resetUserPassword(resetPasswordData: PasswordResetData): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userPasswordRecoveryToken: UserPasswordRecoveryToken | null =
      await queryRunner.manager.findOne(UserPasswordRecoveryToken, {
        where: { token: resetPasswordData.code },
        relations: ["user"]
      });

    if (!userPasswordRecoveryToken) throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID("code"));
    if (userPasswordRecoveryToken.expirationDate < new Date()) throw new BadRequestError(ERROR_MESSAGES.VALIDATION.INVALID("code (expired)"));

    const user: User = userPasswordRecoveryToken.user;
    user.password = getHashedPassword(resetPasswordData.password);

    await queryRunner.manager.save(user);
    await queryRunner.manager.remove(userPasswordRecoveryToken);

    await queryRunner.commitTransaction();
    return;
  } catch (err: unknown) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    throw err;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Sends a verification code to the user's email.
 * Runs inside a transaction to avoid race conditions.
 * Creates or updates the verification token and sends the email.
 *
 * @param {string} email - User email
 * @param {Mailer} mailer - Mailer service to send the verification email
 * @returns {Promise<{ code: string }>} Verification code
 * @throws {NotFoundError} If user is not found
 * @throws {ConflictError} If account is already verified
 */
export async function sendVerificationCode(email: string, mailer: Mailer): Promise<{ code: string }> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const user: User | null = await queryRunner.manager.findOne(User, {
      where: { email },
      relations: ["verificationToken"]
    });
    if (!user) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);

    if (user.isVerified) throw new ConflictError(ERROR_MESSAGES.CONFLICT.ACCOUNT_ALREADY_VERIFIED);

    if (user.verificationToken) {
      await queryRunner.manager.remove(user.verificationToken);
    }

    const verificationToken = new UserVerificationToken();
    verificationToken.token = generateUserToken();
    verificationToken.expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); 
    verificationToken.user = user;
    await queryRunner.manager.save(verificationToken);

    await queryRunner.commitTransaction();

    mailer.sendEmail(EmailType.REGISTRATION, user.name, verificationToken.token);

    return { code: verificationToken.token }
  } catch (err) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    throw err;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Changes the user's password.
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {number} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>} True if password was changed
 * @throws {BadRequestError} If current password is incorrect
 * @throws {NotFoundError} If user is not found
 */
export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const user: User | null = await queryRunner.manager.createQueryBuilder(User, 'user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

     if (!user) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);
     if (!isValidPassword(currentPassword, user.password)) throw new BadRequestError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
     user.password = getHashedPassword(newPassword);
     await queryRunner.manager.save(user);
     await queryRunner.commitTransaction();

     return;
   } catch (err) {
     if (queryRunner.isTransactionActive) {
       await queryRunner.rollbackTransaction();
     }
     throw err;
   } finally {
     await queryRunner.release();
   }
}

/**
 * Updates the user's profile (name and metadata).
 * Runs inside a transaction to avoid race conditions.
 *
 * @param {number} userId - User ID
 * @param {string} name - New name
 * @param {string }surname = New surname
 * @param {any} metadata - New metadata
 * @returns {Promise<User>} Updated user object
 * @throws {NotFoundError} If user is not found
 */
export async function updateUserProfile(userId: number, name?: string, surname?: string, metadata?: any): Promise<User> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const user: User | null = await queryRunner.manager.findOne(User, { where: { id: userId } });
    if (!user) throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);
    if (name) user.name = name;
    if(surname) user.surname = surname;
    if (metadata !== undefined) user.metadata = metadata;
    await queryRunner.manager.save(user);
    await queryRunner.commitTransaction();
    removeUserPrivateValues(user as any);
    return user.getFormattedUser ? user.getFormattedUser() : user;
  } catch (err) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    throw err;
  } finally {
    await queryRunner.release();
  }
}
