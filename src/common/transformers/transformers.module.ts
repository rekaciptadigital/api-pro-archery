import { Module, Global } from '@nestjs/common';
import { ResponseTransformer } from './response.transformer';

@Global()
@Module({
  providers: [ResponseTransformer],
  exports: [ResponseTransformer],
})
export class TransformersModule {}