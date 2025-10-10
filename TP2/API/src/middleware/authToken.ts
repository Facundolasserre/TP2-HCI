import {NextFunction, Request, Response} from "express";
import {tokenBlacklist} from "../controllers/user.controller";
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/user';
import { UnauthorizedError, NotFoundError } from '../types/errors';
import { ERROR_MESSAGES } from '../types/errorMessages';

export async function authenticateJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new UnauthorizedError(ERROR_MESSAGES.AUTH.TOKEN_MISSING);
        }

        if (tokenBlacklist.has(token)) {
            throw new UnauthorizedError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN) as jwt.JwtPayload;
        if (!decoded.sub) throw new UnauthorizedError(ERROR_MESSAGES.AUTH.INVALID_TOKEN);
        const user = await User.findOneBy({ id: parseInt(decoded.sub as string) });

        if (!user) {
            throw new NotFoundError(ERROR_MESSAGES.NOT_FOUND.USER);
        }

        req.user = user;
        next();
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        if (err instanceof UnauthorizedError) {
            res.status(401).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}