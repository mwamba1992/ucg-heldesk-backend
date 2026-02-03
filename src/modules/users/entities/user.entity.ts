import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 100 })
  fullName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.REQUESTER })
  role: UserRole;

  @Column({ nullable: true, length: 100 })
  department: string;

  @Column({ nullable: true, length: 100 })
  location: string;

  @Column({ nullable: true, length: 255 })
  ldapDn: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
