export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}
