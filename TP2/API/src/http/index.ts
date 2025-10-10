import { Response } from "express";
import { HttpError, NotFoundError } from "../types/errors";

export function replyWithError(res: Response, error: any) {
  if (error instanceof HttpError) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(error.status).json({ message: error.message });
  }
  console.error('Unexpected error:', error);
  return res.status(500).json({ message: 'Internal server error' });
}

export function replySuccess(res: Response, content: any) {
  return res.status(200).json(content);
}

export function replyCreated(res: Response, content: any) {
  return res.status(201).json(content);
}

export function replyNoContent(res: Response) {
  return res.status(204).send();
}