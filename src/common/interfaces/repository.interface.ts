import { DeleteResult, FindOptionsWhere, DeepPartial, FindOneOptions, FindManyOptions, Repository, ObjectLiteral } from 'typeorm';

export interface IBaseRepository<T extends ObjectLiteral, IdType = number | string> {
  findById(id: IdType): Promise<T | null>;
  findOne(where: FindOptionsWhere<T>): Promise<T | null>;
  findOneWithOptions(options: FindOneOptions<T>): Promise<T | null>;
  findAll(): Promise<T[]>;
  findWithOptions(options: FindManyOptions<T>): Promise<T[]>;
  findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;
  create(data: DeepPartial<T>): Promise<T>;
  update(id: IdType, data: DeepPartial<T>): Promise<T>;
  softDelete(id: IdType): Promise<DeleteResult>;
  createQueryBuilder(alias: string): any;
  getRepository(): Repository<T>;
}