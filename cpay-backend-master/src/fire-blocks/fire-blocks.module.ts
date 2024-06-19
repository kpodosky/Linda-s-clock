import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FireBlocksService } from './service/fire-block.service';
import { SequelizeModule } from '@nestjs/sequelize';
@Global()
@Module({
  providers: [FireBlocksService],
  imports: [HttpModule, SequelizeModule.forFeature([])],

  exports: [FireBlocksService],
})
export class FireBlocksModule {}
