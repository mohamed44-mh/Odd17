export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Not found') { super(msg, 404); }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') { super(msg, 401); }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') { super(msg, 403); }
}
export class ValidationError extends AppError {
  constructor(msg = 'Validation failed', errors = {}) {
    super(msg, 422);
    this.errors = errors;
  }
}
export class ConflictError extends AppError {
  constructor(msg = 'Conflict') { super(msg, 409); }
}
