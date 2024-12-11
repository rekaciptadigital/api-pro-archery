import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VerifyTokenService } from '../../application/services/verify-token.service';
import { JwtAuthGuard } from '../../domain/guards/jwt-auth.guard';
import { FastifyRequest } from 'fastify';
import { RequestUtil } from '../../../../common/utils/request.util';

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VerifyTokenController {
  constructor(private readonly verifyTokenService: VerifyTokenService) {}

  @Get('verify-token')
  @ApiOperation({ summary: 'Verify current JWT token validity' })
  @ApiResponse({ status: 200, description: 'Token verification result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyToken(@Req() request: FastifyRequest) {
    const token = RequestUtil.getAuthToken(request);
    return this.verifyTokenService.verify(token || '');
  }
}