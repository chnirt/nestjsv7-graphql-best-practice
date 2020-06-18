import { Module, CacheModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as Resolvers from './resolvers';
import { GraphqlService, TypeOrmService, CacheService } from './config';
import { DateScalar, UploadScalar } from './config/graphql/scalars';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      useClass: GraphqlService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmService,
    }),
    CacheModule.registerAsync({
      useClass: CacheService,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ...Object.values(Resolvers),
    DateScalar,
    UploadScalar,
  ],
})
export class AppModule {}
