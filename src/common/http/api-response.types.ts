export type ApiSuccessResponse<T = unknown> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  data: null;
  errors?: Record<string, string[]>;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    (body as ApiErrorResponse).success === false
  );
}

export function isApiSuccessResponse<T>(
  body: unknown,
): body is ApiSuccessResponse<T> {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    (body as ApiSuccessResponse<T>).success === true
  );
}
