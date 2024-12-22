import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiEndpointRepository } from '../../domain/repositories/api-endpoint.repository';
import { CreateApiEndpointDto, UpdateApiEndpointDto } from '../dtos/api-endpoint.dto';
import { ResponseTransformer } from '@/common/transformers/response.transformer';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';
import { RoleRepository } from '@/modules/roles/domain/repositories/role.repository';

@Injectable()
export class ApiEndpointService {
  constructor(
    private readonly apiEndpointRepository: ApiEndpointRepository,
    private readonly roleRepository: RoleRepository,
    private readonly responseTransformer: ResponseTransformer
  ) {}

  async create(createApiEndpointDto: CreateApiEndpointDto) {
    if (createApiEndpointDto.role_id) {
      const role = await this.roleRepository.findById(createApiEndpointDto.role_id);
      if (!role) {
        throw new DomainException('Role not found', HttpStatus.NOT_FOUND);
      }
    }

    const existingEndpoint = await this.apiEndpointRepository.findByPathAndMethod(
      createApiEndpointDto.path,
      createApiEndpointDto.method
    );

    if (existingEndpoint) {
      throw new DomainException(
        'API endpoint with this path and method already exists',
        HttpStatus.CONFLICT
      );
    }

    const endpoint = await this.apiEndpointRepository.create({
      ...createApiEndpointDto,
      is_public: createApiEndpointDto.is_public ?? false
    });

    return this.responseTransformer.transform(endpoint);
  }

  async findAll() {
    const endpoints = await this.apiEndpointRepository.findAll();
    return this.responseTransformer.transform(endpoints);
  }

  async findOne(id: number) {
    const endpoint = await this.apiEndpointRepository.findById(id);
    if (!endpoint) {
      throw new NotFoundException('API endpoint not found');
    }
    return this.responseTransformer.transform(endpoint);
  }

  async update(id: number, updateApiEndpointDto: UpdateApiEndpointDto) {
    const endpoint = await this.apiEndpointRepository.findById(id);
    if (!endpoint) {
      throw new NotFoundException('API endpoint not found');
    }

    if (updateApiEndpointDto.role_id) {
      const role = await this.roleRepository.findById(updateApiEndpointDto.role_id);
      if (!role) {
        throw new DomainException('Role not found', HttpStatus.NOT_FOUND);
      }
    }

    if (updateApiEndpointDto.path || updateApiEndpointDto.method) {
      const existingEndpoint = await this.apiEndpointRepository.findByPathAndMethod(
        updateApiEndpointDto.path || endpoint.path,
        updateApiEndpointDto.method || endpoint.method
      );

      if (existingEndpoint && existingEndpoint.id !== id) {
        throw new DomainException(
          'Another API endpoint with this path and method already exists',
          HttpStatus.CONFLICT
        );
      }
    }

    const updated = await this.apiEndpointRepository.update(id, updateApiEndpointDto);
    return this.responseTransformer.transform(updated);
  }

  async remove(id: number) {
    const endpoint = await this.apiEndpointRepository.findById(id);
    if (!endpoint) {
      throw new NotFoundException('API endpoint not found');
    }

    await this.apiEndpointRepository.softDelete(id);
    return this.responseTransformer.transform({ message: 'API endpoint deleted successfully' });
  }

  async restore(id: number) {
    const endpoint = await this.apiEndpointRepository.findWithDeleted(id);
    if (!endpoint) {
      throw new NotFoundException('API endpoint not found');
    }

    if (!endpoint.deleted_at) {
      throw new DomainException('API endpoint is not deleted', HttpStatus.BAD_REQUEST);
    }

    const restored = await this.apiEndpointRepository.restore(id);
    if (!restored) {
      throw new DomainException('Failed to restore API endpoint', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.responseTransformer.transform(restored);
  }
}