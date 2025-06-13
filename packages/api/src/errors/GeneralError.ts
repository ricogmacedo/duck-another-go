import {
	StatusCodes
} from "http-status-codes";

export class GeneralError extends Error {
  public statusCode: number;

  get name() {
    return this.constructor.name;
  }

  constructor(message?: string, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);

    this.statusCode = statusCode;

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, new.target.prototype);
    } else {
      (this as any).__proto__ = new.target.prototype;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}