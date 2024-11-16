import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserNotificationScheduleDto {
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsNotEmpty()
  @IsUUID()
  groupId!: string;

  @IsNotEmpty()
  @IsString()
  recurrence!: string;  // e.g., 'rate(6 hours)' or 'cron(0 9 * * ? *)'
}
