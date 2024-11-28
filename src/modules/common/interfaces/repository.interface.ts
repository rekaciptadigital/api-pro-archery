import { DeleteResult, FindOptionsWhere, DeepPartial } from 'typeorm';

export interface IBaseRepository<T> {
  findById(id: number): Promise<T | null>;
  findOne(where: FindOptionsWhere<T>): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: DeepPartial<T>): Promise<T>;
  update(id: number, data: DeepPartial<T>): Promise<T>;
  softDelete(id: number): Promise<DeleteResult>;
}