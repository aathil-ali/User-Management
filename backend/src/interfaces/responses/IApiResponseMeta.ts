export interface IApiResponseMeta {
  correlationId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
