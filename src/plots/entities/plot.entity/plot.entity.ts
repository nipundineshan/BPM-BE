import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { User } from '../../../users/entities/user.entity/user.entity';

@Entity('plots')
export class Plot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  location: string;

  @Column('decimal')
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  documentUrl: string;

  @Column({ nullable: true })
  ipfsHash: string;

  @Column({ nullable: true })
  tokenId: number;

  @Column({ default: false })
  isMinted: boolean;

  @Column({ default: 'pending' })
  verificationStatus: string; // 'pending', 'verified', 'rejected'

  @ManyToOne('User', 'plots')
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
