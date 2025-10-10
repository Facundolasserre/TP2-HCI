import { Request, Response } from "express";
import {replyCreated, replySuccess, replyWithError} from '../http';
import { Mailer } from '../services/email.service';
import * as UserService from '../services/user.service';
import { BadRequestError } from '../types/errors';
import {
  LoginUserData,
  PasswordRecoveryData,
  PasswordResetData,
  RegisterUserData,
  VerificationData,
  isValidChangePassword,
  isValidEmail,
  isValidLoginData,
  isValidModificationData,
  isValidPasswordRecoveryData,
  isValidPasswordResetData,
  isValidRegistrationData,
  isValidVerificationTokenData,
} from '../types/user';
import {User} from "../entities/user";
import { ERROR_MESSAGES } from '../types/errorMessages';

export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidRegistrationData(req.body);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }

    if (req.body.password.length < 6) {
      throw new BadRequestError(ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT);
    }

    const userData: RegisterUserData = req.body as RegisterUserData;
    const mailer: Mailer = req.app.locals.mailer;

    replyCreated(res, await UserService.createNewUser(userData, mailer));

  } catch (err) {
    replyWithError(res, err);
  }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    replySuccess(res, await UserService.getUserService(req.user as User));
  } catch (err) {
    replyWithError(res, err);
  }
}


export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidLoginData(req.body);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }

    const emailValidation = isValidEmail(req.body.email);
    if (!emailValidation.isValid) {
      throw new BadRequestError(emailValidation.message);
    }

    const userData: LoginUserData = req.body as LoginUserData;
    replySuccess(res, { token: await UserService.createNewUserToken(userData)});
  } catch (err) {
    replyWithError(res, err);
  }
}

export let tokenBlacklist = new Set();
export function logoutUser(req: Request, res: Response): void {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      tokenBlacklist.add(token);
    }

    replySuccess(res, {});

  } catch (err) {
    replyWithError(res, err);
  }
}

export async function verifyUser(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidVerificationTokenData(req.body);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }

    const { code } = req.body as VerificationData;
    replySuccess(res, await UserService.verifyUser(code as string));
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function sendVerificationCode(req: Request, res: Response): Promise<void> {
  try {
    const email = req.query.email as string;
    if (!email) {
      throw new BadRequestError(ERROR_MESSAGES.VALIDATION.REQUIRED("email"));
    }

    const emailValidation = isValidEmail(email);
    if (!emailValidation.isValid) {
      throw new BadRequestError(emailValidation.message);
    }

    const mailer: Mailer = req.app.locals.mailer;
    replySuccess(res, await UserService.sendVerificationCode(email, mailer));
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function sendPasswordRecoveryCode(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidPasswordRecoveryData(req.query);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }

    const { email } = req.query as PasswordRecoveryData;
    
    const emailValidation = isValidEmail(email);
    if (!emailValidation.isValid) {
      throw new BadRequestError(emailValidation.message);
    }

    const mailer: Mailer = req.app.locals.mailer;
    await UserService.sendPasswordRecoveryEmail(email, mailer)
    replySuccess(res, {});
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const validation = isValidPasswordResetData(req.body);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }
    await UserService.resetUserPassword(req.body as PasswordResetData)
    replySuccess(res, {});
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.user as User).id;
    const validation = isValidChangePassword(req.body);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }
    
    const { currentPassword, newPassword } = req.body;
    await UserService.changePassword(userId, currentPassword, newPassword)
    replySuccess(res, {});
  } catch (err) {
    replyWithError(res, err);
  }
}

export async function updateUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.user as User).id;
    const validation = isValidModificationData(req.body);
    if (!validation.isValid) {
      throw new BadRequestError(validation.message);
    }

    const { name, surname, metadata } = req.body;
    replySuccess(res, await UserService.updateUserProfile(userId, name, surname, metadata));
  } catch (err) {
    replyWithError(res, err);
  }
}