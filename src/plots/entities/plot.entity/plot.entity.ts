import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity/user.entity';
import { PropertyImage } from '../property-image.entity';
import { LegalDocument } from '../legal-document.entity';

export enum PlotStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  MINTED = 'minted',
}

@Entity('plots')
export class Plot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  plotName: string;

  @Column('text')
  description: string;

  @Column()
  surveyNumber: string;

  @Column()
  areaSize: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column()
  address: string;

  @Column()
  district: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  marketValue: number;

  @Column()
  registrationNumber: string;

  @OneToMany(() => PropertyImage, (image) => image.plot, { cascade: true })
  propertyImages: PropertyImage[];

  @OneToMany(() => LegalDocument, (doc) => doc.plot, { cascade: true })
  legalDocuments: LegalDocument[];

  @Column({
    type: 'enum',
    enum: PlotStatus,
    default: PlotStatus.DRAFT,
  })
  status: PlotStatus;

  @Column({ nullable: true })
  tokenId: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ nullable: true })
  ipfsCid: string;

  @ManyToOne(() => User, (user) => user.plots)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
