import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { VerifyTokenResponse } from '../../domain/interfaces/verify-token-response.interface';
import { ResponseTransformer } from '../../../../common/transformers/response.transformer';
import { ApiResponse } from '../../../../common/interfaces/api-response.interface';

@Injectable()
export class VerifyTokenService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async verify(token: string): Promise<ApiResponse<VerifyTokenResponse>> {
    try {
      const payload = await this.tokenService.verifyToken(token);
      const user = await this.userRepository.findById(payload.sub);

      if (!user || !user.status) {
        return this.responseTransformer.transform({ isValid: false }, false);
      }

      const response: VerifyTokenResponse = {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        expiresIn: payload.exp ? payload.exp * 1000 - Date.now() : undefined
      };

      return this.responseTransformer.transform(response, false);
    } catch (error) {
      return this.responseTransformer.transform({ isValid: false }, false);
    }
  }
}