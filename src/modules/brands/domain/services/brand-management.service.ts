import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../repositories/brand.repository';
import { CreateBrandDto } from '../../application/dtos/brand.dto';
import { DomainException } from '@/common/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class BrandManagementService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async handleBrandCreation(createBrandDto: CreateBrandDto) {
    // Check if brand exists (including soft deleted)
    const existingBrand = await this.brandRepository.findByCodeIncludingDeleted(
      createBrandDto.code
    );

    if (existingBrand) {
      if (existingBrand.deleted_at) {
        // Restore and update the brand
        await this.brandRepository.restore(existingBrand.id);
        const updated = await this.brandRepository.update(existingBrand.id, {
          ...createBrandDto,
          status: createBrandDto.status ?? true
        });
        return { restored: true, brand: updated };
      } else {
        throw new DomainException('Brand code already exists', HttpStatus.CONFLICT);
      }
    }

    // Create new brand
    const brand = await this.brandRepository.create({
      ...createBrandDto,
      status: createBrandDto.status ?? true
    });

    return { restored: false, brand };
  }

  async validateBrandCodeForUpdate(code: string, excludeId: number): Promise<void> {
    const existingBrand = await this.brandRepository.findByCode(code, excludeId);
    if (existingBrand) {
      throw new DomainException('Brand code already in use', HttpStatus.CONFLICT);
    }
  }
}