import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  entityType: string;

  @Column('uuid')
  entityId: string;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ nullable: true })
  performedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performedBy' })
  performer: User;

  @CreateDateColumn()
  createdAt: Date;
}
