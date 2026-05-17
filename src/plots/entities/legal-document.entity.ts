import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Plot } from './plot.entity/plot.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('legal_documents')
export class LegalDocument {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  fileName: string;

  @Column()
  @ApiProperty()
  mimeType: string;

  @Column('bigint')
  @ApiProperty()
  size: number;

  @Column({ type: 'bytea' })
  data: Buffer;

  @ManyToOne(() => Plot, (plot) => plot.legalDocuments, { onDelete: 'CASCADE' })
  plot: Plot;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;
}
