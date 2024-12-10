import { Repository, FindOptionsWhere, DeleteResult, ObjectLiteral, DeepPartial, FindOneOptions, FindManyOptions } from 'typeorm';
import { IBaseRepository } from '../interfaces/repository.interface';

export abstract class BaseRepository<T extends ObjectLiteral, IdType = number | string> implements IBaseRepository<T, IdType> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: IdType): Promise<T | null> {
    return this.repository.findOne({ 
      where: { id } as unknown as FindOptionsWhere<T>
    });
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  async findOneWithOptions(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findWithOptions(options: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount(options);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: IdType, data: DeepPartial<T>): Promise<T> {
    await this.repository.update(id as any, data as any);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Entity not found after update');
    }
    return updated;
  }

  async softDelete(id: IdType): Promise<DeleteResult> {
    return this.repository.softDelete(id as any);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  getRepository(): Repository<T> {
    return this.repository;
  }
}