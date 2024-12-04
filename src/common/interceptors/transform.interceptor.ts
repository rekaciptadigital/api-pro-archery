import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse } from "../interfaces/api-response.interface";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || HttpStatus.OK;

        // Handle paginated responses
        if (data?.pagination) {
          const { data: items, pagination } = data;
          return {
            status: {
              code: statusCode,
              message: "Success",
            },
            data: {
              items,
              pagination: {
                currentPage: pagination.meta.currentPage,
                totalPages: pagination.meta.totalPages,
                pageSize: pagination.meta.itemsPerPage,
                totalItems: pagination.meta.totalItems,
                hasNext: pagination.meta.hasNextPage,
                hasPrevious: pagination.meta.hasPreviousPage,
              },
            },
          };
        }

        // Handle non-paginated responses
        return {
          status: {
            code: statusCode,
            message: "Success",
          },
          data: {
            items: Array.isArray(data) ? data : [data],
          },
        };
      })
    );
  }
}