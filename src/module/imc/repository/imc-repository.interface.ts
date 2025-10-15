import { ImcEntity } from '../entities/imc.entity';
import { User } from '../../user/entities/user.entity';

export interface IImcRepository {
    createAndSave(data: ImcEntity): Promise<ImcEntity>;

    findByUser(user: User, esDescendente: boolean, skip: number, take?: number): Promise<ImcEntity[]>;
}
