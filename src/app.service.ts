import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot, PlotStatus } from './plots/entities/plot.entity/plot.entity';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Plot)
    private plotRepository: Repository<Plot>,
  ) {}

  async onModuleInit() {
    await this.migrateDraftToSubmitted();
  }

  async migrateDraftToSubmitted() {
    try {
      // 1. Check existing enum values for diagnostics
      const enumValues = await this.plotRepository.query(`
        SELECT enumlabel 
        FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'plots_status_enum'
      `);
      console.log('Current DB Enum Values:', enumValues.map(v => v.enumlabel));

      // 2. Forcefully add 'submitted' to the enum if it's missing
      // Note: ALTER TYPE ... ADD VALUE cannot be executed in a transaction block in some PG versions,
      // but TypeORM query runner might wrap it. 
      try {
        await this.plotRepository.query(`ALTER TYPE "plots_status_enum" ADD VALUE IF NOT EXISTS 'submitted'`);
        console.log("Ensured 'submitted' exists in plots_status_enum");
      } catch (e) {
        console.log("Note: Could not add 'submitted' to enum (it might already exist or we are in a transaction):", e.message);
      }

      // 3. Update 'draft' to 'submitted'
      await this.plotRepository.query(`
        UPDATE "plots" 
        SET "status" = 'submitted' 
        WHERE "status"::text = 'draft'
      `);
      console.log('Raw SQL migration of draft plots completed.');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
