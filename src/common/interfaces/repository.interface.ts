import { DeleteResult, FindOptionsWhere, DeepPartial, FindOneOptions, FindManyOptions } from 'typeorm';

export interface IBaseRepository<T> {
  findById(id: number): Promise<T | null>;
  findOne(where: FindOptionsWhere<T>): Promise<T | null>;
  findOneWithOptions(options: FindOneOptions<T>): Promise<T | null>;
  findAll(): Promise<T[]>;
  findWithOptions(options: FindManyOptions<T>): Promise<T[]>;
  findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;
  create(data: DeepPartial<T>): Promise<T>;
  update(id: number, data: DeepPartial<T>): Promise<T>;
  softDelete(id: number): Promise<DeleteResult>;
  createQueryBuilder(alias: string): any;
}