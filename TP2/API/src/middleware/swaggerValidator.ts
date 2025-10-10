import { NextFunction, Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../types/errors";


export default function (error: any, req: Request, res: Response, next: NextFunction): void {
  if(error) {
    if(error instanceof UnauthorizedError) {
      next(error);
      return;
    } 
    if(error.results && error.results.errors.length > 0) {
      const errorMessages = error.results.errors.map((error: any) => error.message).join(', ');
      next(new BadRequestError(errorMessages));
      return;
    }
    next(new BadRequestError(error.message));
    return;
  }
  next();
}