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
import { DateUtil } from "../utils/date.util";

@Injectable()
export class TransformInterceptor<T extends Record<string, any>>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response?.status?.code) {
          return response;
        }

        const formattedData = Array.isArray(response)
          ? response.map(item => DateUtil.formatTimestamps<T>(item))
          : DateUtil.formatTimestamps<T>(response);

        return {
          status: {
            code: context.switchToHttp().getResponse().statusCode || HttpStatus.OK,
            message: "Success",
          },
          data: Array.isArray(formattedData) ? formattedData : [formattedData],
        };
      })
    );
  }
}