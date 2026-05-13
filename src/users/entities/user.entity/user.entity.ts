import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import type { Plot } from '../../../plots/entities/plot.entity/plot.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true, nullable: true })
  walletAddress: string;

  @Column({ default: 'user' })
  role: string; // 'user' or 'admin'

  @OneToMany('Plot', 'owner')
  plots: Plot[];

  @CreateDateColumn()
  createdAt: Date;
}
