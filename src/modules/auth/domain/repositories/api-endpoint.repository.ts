import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiEndpoint } from '../entities/api-endpoint.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class ApiEndpointRepository extends BaseRepository<ApiEndpoint> {
  constructor(
    @InjectRepository(ApiEndpoint)
    private readonly apiEndpointRepository: Repository<ApiEndpoint>
  ) {
    super(apiEndpointRepository);
  }

  async findByPathAndMethod(path: string, method: string): Promise<ApiEndpoint | null> {
    return this.apiEndpointRepository.findOne({
      where: { path, method }
    });
  }
}