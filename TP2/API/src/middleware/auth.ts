import { NextFunction, Request, Response } from "express";
import { anonymousRoutes } from "../utils/endpoints";
import { PassportStatic } from "passport";
import { replyWithError } from "../http";
import { UnauthorizedError } from "../types/errors";
import { User } from "../entities/user";

export default function(passport: PassportStatic) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalUrl: string = req.originalUrl;
    const isAnonymous: boolean = anonymousRoutes.some((route) => originalUrl.includes(route.path));
    if (isAnonymous || (originalUrl === "/api/users" && req.method === "POST")) {
      next();
      return;
    }
    passport.authenticate('jwt', { session: false }, (err: any, user: Express.User | false | null) => {
      if(err || !user) {
        replyWithError(res, new UnauthorizedError());
        return;
      }
      if(!(user as User).isVerified) {
        replyWithError(res, new UnauthorizedError('User is not verified!'));
        return;
      }
      req.user = user;
      next();
    })(req, res, next);
  }
}