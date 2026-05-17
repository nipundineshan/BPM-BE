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
      // Use raw query to bypass TypeORM enum validation
      // We check if 'draft' exists as a value in the table and update it to 'submitted'
      // The cast to text allows us to handle cases where the enum itself might not have 'draft' anymore
      await this.plotRepository.query(`
        UPDATE "plots" 
        SET "status" = 'submitted' 
        WHERE "status"::text = 'draft'
      `);
      console.log('Raw SQL migration of draft plots completed.');
    } catch (error) {
      console.error('Migration failed:', error);
      // If the above fails, it might be because the enum itself needs to be fixed.
      // But usually, casting to text in the WHERE clause works.
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
