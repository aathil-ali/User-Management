import { IApiResponseMeta } from '@/interfaces/responses/IApiResponseMeta';

export class SuccessResponse<T> {
  public readonly success = true;
  public readonly timestamp: Date;
  public readonly correlationId?: string;
  public readonly requestId?: string;
  public readonly path?: string;
  public readonly method?: string;

  constructor(
    public data: T,
    public message: string,
    public meta: IApiResponseMeta
  ) {
    this.timestamp = new Date();
    this.correlationId = meta.correlationId;
    this.requestId = meta.requestId;
    this.path = meta.path;
    this.method = meta.method;
  }

  public static create<T>(
    data: T,
    message: string,
    meta: IApiResponseMeta
  ): SuccessResponse<T> {
    return new SuccessResponse(data, message, meta);
  }

  public static createWithPagination<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string,
    meta: IApiResponseMeta
  ): SuccessResponse<T[]> {
    const paginatedMeta = {
      ...meta,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    };
    return new SuccessResponse(data, message, paginatedMeta);
  }
}
