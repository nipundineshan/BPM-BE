import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { Plot } from '../../../plots/entities/plot.entity/plot.entity';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ unique: true, nullable: true })
  walletAddress: string;

  @Column({ nullable: true })
  governmentId: string; // Aadhaar / Passport / ID

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_APPROVAL,
  })
  status: UserStatus;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: 0 })
  loginCount: number;

  @OneToMany('Plot', 'owner')
  plots: Plot[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
