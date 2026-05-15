import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity/user.entity';
import { Plot } from '../../plots/entities/plot.entity/plot.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hash: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column()
  action: string; // e.g., 'MINT', 'TRANSFER'

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Plot)
  plot: Plot;

  @CreateDateColumn()
  createdAt: Date;
}
