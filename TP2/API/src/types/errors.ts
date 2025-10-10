import { EntityNotFoundError, QueryFailedError } from "typeorm";
import { ERROR_MESSAGES } from './errorMessages';

export class HttpError {
  constructor(public status: number, public message: string | string[]) {
    this.status = status;
    this.message = message;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string | string[] = 'Bad request') {
      super(400, message);
    }
  }

export class ServerError extends HttpError {
  constructor(message: string | string[] = 'Server error') {
    super(500, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string | string[] = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string | string[] = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string | string[] = 'Not found') {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string | string[] = 'Not found') {
    super(409, message);
  }
}

export class UnprocessableError extends HttpError {
  constructor(message: string | string[] = 'Not found') {
    super(422, message);
  }
}

export function handleCaughtError(err: unknown) {
  console.error(err);
  switch(err.constructor) {
    case QueryFailedError: {
      if ((err as QueryFailedError).driverError.message.includes('UNIQUE constraint failed: user.email')) {
        throw new ConflictError(ERROR_MESSAGES.CONFLICT.EMAIL_EXISTS);
      }
      if ((err as QueryFailedError).driverError.message.includes('UNIQUE constraint failed: list.name, list.ownerId')) {
        throw new ConflictError(ERROR_MESSAGES.CONFLICT.LIST_NAME_EXISTS);
      }
      throw new BadRequestError((err as QueryFailedError).message);
    }
    case EntityNotFoundError: {
      throw new NotFoundError((err as EntityNotFoundError).message);
    }
    default:
      throw err;
  }
}