"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
const enums_1 = require("../../common/enums");
let UsersService = UsersService_1 = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async seedAdminUser() {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const adminExists = await this.userRepository.findOne({
            where: { username: 'admin' },
        });
        if (!adminExists) {
            const admin = this.userRepository.create({
                username: 'admin',
                email: 'admin@helpdesk.local',
                fullName: 'System Administrator',
                role: enums_1.UserRole.ADMIN,
                password: hashedPassword,
                department: 'IT',
                location: 'Headquarters',
            });
            await this.userRepository.save(admin);
            this.logger.log('Admin user seeded successfully');
        }
        const agentExists = await this.userRepository.findOne({
            where: { username: 'agent' },
        });
        if (!agentExists) {
            const agent = this.userRepository.create({
                username: 'agent',
                email: 'agent@helpdesk.local',
                fullName: 'Support Agent',
                role: enums_1.UserRole.AGENT,
                password: hashedPassword,
                department: 'IT Support',
                location: 'Headquarters',
            });
            await this.userRepository.save(agent);
            this.logger.log('Agent user seeded successfully');
        }
        const requesterExists = await this.userRepository.findOne({
            where: { username: 'user' },
        });
        if (!requesterExists) {
            const requester = this.userRepository.create({
                username: 'user',
                email: 'user@helpdesk.local',
                fullName: 'John Doe',
                role: enums_1.UserRole.REQUESTER,
                password: hashedPassword,
                department: 'Finance',
                location: 'Building A',
            });
            await this.userRepository.save(requester);
            this.logger.log('Requester user seeded successfully');
        }
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: [
                { username: createUserDto.username },
                { email: createUserDto.email },
            ],
        });
        if (existingUser) {
            throw new common_1.ConflictException('Username or email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        const savedUser = await this.userRepository.save(user);
        const { password, ...result } = savedUser;
        this.logger.log(`User created: ${savedUser.username}`);
        return result;
    }
    async findAll(options = {}) {
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
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByUsername(username) {
        return this.userRepository.findOne({ where: { username } });
    }
    async findByUsernameWithPassword(username) {
        return this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.username = :username', { username })
            .getOne();
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUser = await this.findByUsername(updateUserDto.username);
            if (existingUser) {
                throw new common_1.ConflictException('Username already exists');
            }
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new common_1.ConflictException('Email already exists');
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
    async deactivate(id) {
        const user = await this.findOne(id);
        user.isActive = false;
        await this.userRepository.save(user);
        this.logger.log(`User deactivated: ${user.username}`);
        return { message: `User ${user.username} has been deactivated` };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map