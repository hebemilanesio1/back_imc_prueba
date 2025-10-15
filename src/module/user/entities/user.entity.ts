import { ImcEntity } from '../../imc/entities/imc.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => ImcEntity, (imc) => imc.user)
  imc: ImcEntity[];
}
