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
      map((response) => {
        // If response is already in the correct format, return it
        if (response?.status?.code) {
          return response;
        }

        // Transform to standard format
        return {
          status: {
            code: context.switchToHttp().getResponse().statusCode || HttpStatus.OK,
            message: "Success",
          },
          data: Array.isArray(response) ? response : [response],
        };
      })
    );
  }
}