import { RequestResult } from '../models';

export function createErrorResponse<T>(text: string, status: number): RequestResult<T> {
  const error = new Error(text);
  error.cause = status;
  return {
    error,
  };
}
