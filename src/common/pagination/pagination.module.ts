import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaginationHelper } from './helpers/pagination.helper';

@Module({
  imports: [ConfigModule],
  providers: [PaginationHelper],
  exports: [PaginationHelper],
})
export class PaginationModule {}