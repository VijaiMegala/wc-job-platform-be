import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationModule } from './organization/organization.module';
import { UserModule } from './users/user.module';
import { RoleModule } from './roles/role.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './jobs/job.module';
import { ApplicationModule } from './applications/application.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { Organization } from './entities/organization.entity';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Job } from './entities/job.entity';
import { Application } from './entities/application.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbSsl = configService.get<string>('DB_SSL', 'false').toLowerCase();
        const sslEnabled = dbSsl === 'true' || dbSsl === '1' || dbSsl === 'yes';
        
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USER', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_NAME', 'job_platform'),
          entities: [Organization, User, Role, Job, Application],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') === 'development',
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    OrganizationModule,
    UserModule,
    RoleModule,
    AuthModule,
    JobModule,
    ApplicationModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
