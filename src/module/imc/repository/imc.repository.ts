import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { IImcRepository } from './imc-repository.interface';
import { ImcEntity } from '../entities/imc.entity';
import { CreateImcDto } from '../dto/create-imc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class ImcRepository implements IImcRepository {
  private readonly logger = new Logger('ImcRepository');

  constructor(
    @InjectRepository(ImcEntity)
    private readonly repository: Repository<ImcEntity>,
  ) {}

  async createAndSave(data: CreateImcDto | ImcEntity): Promise<ImcEntity> {
    
    this.logger.debug(`Creando registro IMC: ${JSON.stringify(data)}`);
    try {
      const imc = this.repository.create(data);
      return await this.repository.save(imc);
    } catch (error) {
      this.logger.error(`Error al crear IMC: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo crear el registro IMC');
    }
  }

  async find(esDescendente: boolean, skip: number, take?: number): Promise<ImcEntity[]> {
    try {
      return this.repository.find({
        order: { fecha: esDescendente ? 'DESC' : 'ASC' },
        skip,
        take,
      });
    } catch (error) {
      this.logger.error(`Error al obtener historial de IMC: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo obtener el historial de IMC');
    }
  }

  async findByUser(user: User, esDescendente: boolean, skip: number, take?: number): Promise<ImcEntity[]> {
    try {
      return this.repository.find({
        where: { user: { id: user.id } },
        order: { fecha: esDescendente ? 'DESC' : 'ASC' },
        skip,
        take,
      });
    } catch (error) {
      this.logger.error(`Error al obtener historial de IMC para usuario ${user.email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo obtener el historial de IMC del usuario');
    }
  }
}
