import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(user: User, title: string, message: string, type: NotificationType = NotificationType.INFO) {
    const notification = this.notificationRepository.create({
      user,
      title,
      message,
      type,
    });
    return this.notificationRepository.save(notification);
  }

  async findAllByUser(userId: string) {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    return this.notificationRepository.update(id, { isRead: true });
  }
}
