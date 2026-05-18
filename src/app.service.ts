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
      // 1. Diagnostic: Check existing enum values
      const enumValues = await this.plotRepository.query(`
        SELECT enumlabel 
        FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'plots_status_enum'
      `);
      console.log(
        'Current DB Enum Values:',
        enumValues.map((v) => v.enumlabel),
      );

      // 2. Forcefully add missing enum values.
      // We use individual try-catch because ALTER TYPE cannot be run inside a transaction block with other commands in some PG versions.
      const valuesToAdd = [
        'submitted',
        'approved',
        'rejected',
        'minted',
        'pending_approval',
      ];
      for (const val of valuesToAdd) {
        try {
          await this.plotRepository.query(
            `ALTER TYPE "plots_status_enum" ADD VALUE IF NOT EXISTS '${val}'`,
          );
          console.log(`Ensured '${val}' exists in plots_status_enum`);
        } catch (e) {
          // Ignore errors if already exists or if it fails due to transaction issues
        }
      }

      // 3. Update 'draft', 'submitted', and 'pending_approval' to 'pending_approval'
      // We use a string cast to ensure it works even if the enum is still being finicky
      await this.plotRepository.query(`
        UPDATE "plots" 
        SET "status" = 'pending_approval'::"plots_status_enum"
        WHERE "status"::text IN ('draft', 'submitted', 'pending_approval')
      `);
      console.log('Raw SQL migration to pending_approval completed.');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
