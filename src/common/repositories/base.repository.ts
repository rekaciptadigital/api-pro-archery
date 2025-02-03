import {
  Repository,
  FindOptionsWhere,
  DeleteResult,
  ObjectLiteral,
  DeepPartial,
  FindOneOptions,
  FindManyOptions,
  SelectQueryBuilder,
  IsNull,
} from "typeorm";
import { IBaseRepository } from "../interfaces/repository.interface";
import { DomainException } from "../exceptions/domain.exception";
import { HttpStatus } from "@nestjs/common";

export abstract class BaseRepository<T extends ObjectLiteral>
  implements IBaseRepository<T>
{
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      } as unknown as FindOptionsWhere<T>,
    });
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({
      where: {
        ...where,
        deleted_at: IsNull(),
      } as unknown as FindOptionsWhere<T>,
    });
  }

  async findOneWithOptions(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne({
      ...options,
      where: {
        ...options.where,
        deleted_at: IsNull(),
      } as unknown as FindOptionsWhere<T>,
    });
  }

  async findAll(): Promise<T[]> {
    return this.repository.find({
      where: {
        deleted_at: IsNull(),
      } as unknown as FindOptionsWhere<T>,
    });
  }

  async findWithOptions(options: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      ...options,
      where: {
        ...options.where,
        deleted_at: IsNull(),
      } as unknown as FindOptionsWhere<T>,
    });
  }

  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount({
      ...options,
      where: {
        ...options?.where,
        deleted_at: IsNull(),
      } as unknown as FindOptionsWhere<T>,
    });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new DomainException("Entity not found", HttpStatus.NOT_FOUND);
    }

    await this.repository.update(id, data as any);

    const updated = await this.findById(id);
    if (!updated) {
      throw new DomainException(
        "Entity not found after update",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return updated;
  }

  async softDelete(id: number): Promise<DeleteResult> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new DomainException("Entity not found", HttpStatus.NOT_FOUND);
    }

    return this.repository.softDelete(id);
  }

  async restore(id: number): Promise<T | null> {
    const existing = await this.findWithDeleted(id);
    if (!existing) {
      throw new DomainException("Entity not found", HttpStatus.NOT_FOUND);
    }

    if (!(existing as any).deleted_at) {
      throw new DomainException(
        "Entity is not deleted",
        HttpStatus.BAD_REQUEST
      );
    }

    await this.repository.restore(id);
    return this.findById(id);
  }

  async findWithDeleted(id: number): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      withDeleted: true,
    });
  }

  async findAndCountWithDeleted(
    options?: FindManyOptions<T>
  ): Promise<[T[], number]> {
    return this.repository.findAndCount({
      ...options,
      withDeleted: true,
    });
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  getRepository(): Repository<T> {
    return this.repository;
  }
}
