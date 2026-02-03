import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/enums';

interface FindAllOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seedAdminUser(): Promise<void> {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Seed Admin user
    const adminExists = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (!adminExists) {
      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@helpdesk.local',
        fullName: 'System Administrator',
        role: UserRole.ADMIN,
        password: hashedPassword,
        department: 'IT',
        location: 'Headquarters',
      });

      await this.userRepository.save(admin);
      this.logger.log('Admin user seeded successfully');
    }

    // Seed Agent user
    const agentExists = await this.userRepository.findOne({
      where: { username: 'agent' },
    });

    if (!agentExists) {
      const agent = this.userRepository.create({
        username: 'agent',
        email: 'agent@helpdesk.local',
        fullName: 'Support Agent',
        role: UserRole.AGENT,
        password: hashedPassword,
        department: 'IT Support',
        location: 'Headquarters',
      });

      await this.userRepository.save(agent);
      this.logger.log('Agent user seeded successfully');
    }

    // Seed Requester user
    const requesterExists = await this.userRepository.findOne({
      where: { username: 'user' },
    });

    if (!requesterExists) {
      const requester = this.userRepository.create({
        username: 'user',
        email: 'user@helpdesk.local',
        fullName: 'John Doe',
        role: UserRole.REQUESTER,
        password: hashedPassword,
        department: 'Finance',
        location: 'Building A',
      });

      await this.userRepository.save(requester);
      this.logger.log('Requester user seeded successfully');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    this.logger.log(`User created: ${savedUser.username}`);
    return result as User;
  }

  async findAll(options: FindAllOptions = {}) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const { role, isActive } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.findByUsername(updateUserDto.username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`User updated: ${savedUser.username}`);
    return savedUser;
  }

  async deactivate(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);

    this.logger.log(`User deactivated: ${user.username}`);
    return { message: `User ${user.username} has been deactivated` };
  }
}
