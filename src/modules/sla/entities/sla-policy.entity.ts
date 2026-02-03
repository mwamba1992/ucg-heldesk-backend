import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Priority } from '../../../common/enums';

@Entity('sla_policies')
export class SlaPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Priority, unique: true })
  priority: Priority;

  @Column()
  firstResponseMinutes: number;

  @Column()
  resolutionTargetMinutes: number;

  @Column()
  escalationAfterMinutes: number;

  @Column({ default: true })
  isActive: boolean;
}
