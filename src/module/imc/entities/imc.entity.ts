import { User } from '../../user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';

@Entity('imc')
export class ImcEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  peso: number;

  @Column('float')
  altura: number;

  @Column('float')
  imc: number;

  @Column()
  categoria: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @ManyToOne(() => User, (user) => user.imc, { eager: true })
  @JoinColumn({ name: 'user_id' }) // 🔹 asegura la FK correcta
  user: User;
  
}

