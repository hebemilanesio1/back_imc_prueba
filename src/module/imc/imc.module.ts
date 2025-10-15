import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcService } from './imc.service';
import { ImcController } from './imc.controller';
import { ImcEntity } from './entities/imc.entity';
import { ImcRepository } from './repository/imc.repository';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ImcEntity, User])],
    controllers: [ImcController],
    providers: [
        ImcService,
        {
            provide: 'IImcRepository',
            useClass: ImcRepository,
        },
    ],
})
export class ImcModule {}
