import { ApiStatus } from '../interfaces/api-response.interface';

export abstract class BaseTransformer {
  protected createSuccessStatus(): ApiStatus {
    return {
      code: 200,
      message: 'Success'
    };
  }

  protected createErrorStatus(code: number): ApiStatus {
    return {
      code,
      message: 'Error'
    };
  }
}