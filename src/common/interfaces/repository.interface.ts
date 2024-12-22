import { DeleteResult, FindOptionsWhere, DeepPartial, FindOneOptions, FindManyOptions, Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

export interface IBaseRepository<T extends ObjectLiteral> {
  findById(id: number): Promise<T | null>;
  findOne(where: FindOptionsWhere<T>): Promise<T | null>;
  findOneWithOptions(options: FindOneOptions<T>): Promise<T | null>;
  findAll(): Promise<T[]>;
  findWithOptions(options: FindManyOptions<T>): Promise<T[]>;
  findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;
  create(data: DeepPartial<T>): Promise<T>;
  update(id: number, data: DeepPartial<T>): Promise<T>;
  softDelete(id: number): Promise<DeleteResult>;
  restore(id: number): Promise<T | null>;
  findWithDeleted(id: number): Promise<T | null>;
  findAndCountWithDeleted(options?: FindManyOptions<T>): Promise<[T[], number]>;
  createQueryBuilder(alias: string): SelectQueryBuilder<T>;
  getRepository(): Repository<T>;
}