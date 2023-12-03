// customError.js
import { HttpStatus } from '@libs/status-code.type';

export class ApiError extends Error {
  statusCode: HttpStatus;

  constructor(message: string, statusCode: HttpStatus) {
    super(message);
    this.statusCode = statusCode;
  }
}
