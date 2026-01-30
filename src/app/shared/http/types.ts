export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ErrorResponseDto = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
};

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};
