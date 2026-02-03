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
var TicketsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_entity_1 = require("./entities/ticket.entity");
const comment_entity_1 = require("./entities/comment.entity");
const enums_1 = require("../../common/enums");
let TicketsService = TicketsService_1 = class TicketsService {
    constructor(ticketRepository, commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.logger = new common_1.Logger(TicketsService_1.name);
        this.ticketCounter = 0;
        this.initializeCounter();
    }
    async initializeCounter() {
        const lastTicket = await this.ticketRepository.findOne({
            where: {},
            order: { createdAt: 'DESC' },
        });
        if (lastTicket) {
            const num = parseInt(lastTicket.ticketNumber.replace('TKT-', ''), 10);
            this.ticketCounter = num;
        }
    }
    generateTicketNumber() {
        this.ticketCounter++;
        return `TKT-${String(this.ticketCounter).padStart(5, '0')}`;
    }
    async create(createTicketDto, user) {
        const ticket = this.ticketRepository.create({
            ...createTicketDto,
            ticketNumber: this.generateTicketNumber(),
            requesterId: user.id,
            status: enums_1.TicketStatus.NEW,
        });
        const savedTicket = await this.ticketRepository.save(ticket);
        this.logger.log(`Ticket created: ${savedTicket.ticketNumber} by ${user.username}`);
        return this.findOne(savedTicket.id);
    }
    async findAll(options = {}, user) {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const { status, priority, assignedTo, requesterId, search } = options;
        const skip = (page - 1) * limit;
        const queryBuilder = this.ticketRepository
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.requester', 'requester')
            .leftJoinAndSelect('ticket.assignee', 'assignee')
            .leftJoinAndSelect('ticket.category', 'category');
        if (user.role === enums_1.UserRole.REQUESTER) {
            queryBuilder.andWhere('ticket.requesterId = :userId', { userId: user.id });
        }
        if (status) {
            queryBuilder.andWhere('ticket.status = :status', { status });
        }
        if (priority) {
            queryBuilder.andWhere('ticket.priority = :priority', { priority });
        }
        if (assignedTo) {
            queryBuilder.andWhere('ticket.assignedTo = :assignedTo', { assignedTo });
        }
        if (requesterId) {
            queryBuilder.andWhere('ticket.requesterId = :requesterId', { requesterId });
        }
        if (search) {
            queryBuilder.andWhere('(ticket.title ILIKE :search OR ticket.ticketNumber ILIKE :search OR ticket.description ILIKE :search)', { search: `%${search}%` });
        }
        const [tickets, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('ticket.createdAt', 'DESC')
            .getManyAndCount();
        return {
            data: tickets,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const ticket = await this.ticketRepository.findOne({
            where: { id },
            relations: ['requester', 'assignee', 'category', 'comments', 'comments.author', 'attachments'],
        });
        if (!ticket) {
            throw new common_1.NotFoundException(`Ticket with ID ${id} not found`);
        }
        return ticket;
    }
    async findByTicketNumber(ticketNumber) {
        const ticket = await this.ticketRepository.findOne({
            where: { ticketNumber },
            relations: ['requester', 'assignee', 'category', 'comments', 'comments.author', 'attachments'],
        });
        if (!ticket) {
            throw new common_1.NotFoundException(`Ticket ${ticketNumber} not found`);
        }
        return ticket;
    }
    async update(id, updateTicketDto, user) {
        const ticket = await this.findOne(id);
        if (user.role === enums_1.UserRole.REQUESTER && ticket.requesterId !== user.id) {
            throw new common_1.ForbiddenException('You can only update your own tickets');
        }
        Object.assign(ticket, updateTicketDto);
        if (updateTicketDto.status && updateTicketDto.status !== ticket.status) {
            if (updateTicketDto.status === enums_1.TicketStatus.RESOLVED) {
                ticket.resolvedAt = new Date();
            }
            if (updateTicketDto.status === enums_1.TicketStatus.CLOSED) {
                ticket.closedAt = new Date();
            }
        }
        if (updateTicketDto.assignedTo && !ticket.assignedTo) {
            ticket.status = enums_1.TicketStatus.ASSIGNED;
        }
        await this.ticketRepository.save(ticket);
        this.logger.log(`Ticket updated: ${ticket.ticketNumber} by ${user.username}`);
        return this.findOne(id);
    }
    async assign(id, assignedTo, user) {
        const ticket = await this.findOne(id);
        ticket.assignedTo = assignedTo;
        if (ticket.status === enums_1.TicketStatus.NEW) {
            ticket.status = enums_1.TicketStatus.ASSIGNED;
        }
        await this.ticketRepository.save(ticket);
        this.logger.log(`Ticket ${ticket.ticketNumber} assigned to ${assignedTo} by ${user.username}`);
        return this.findOne(id);
    }
    async addComment(id, createCommentDto, user) {
        const ticket = await this.findOne(id);
        if (createCommentDto.isInternal && user.role === enums_1.UserRole.REQUESTER) {
            throw new common_1.ForbiddenException('Requesters cannot create internal comments');
        }
        if (!ticket.firstResponseAt && user.role !== enums_1.UserRole.REQUESTER) {
            ticket.firstResponseAt = new Date();
            await this.ticketRepository.save(ticket);
        }
        const comment = this.commentRepository.create({
            ...createCommentDto,
            ticketId: id,
            authorId: user.id,
        });
        const savedComment = await this.commentRepository.save(comment);
        this.logger.log(`Comment added to ticket ${ticket.ticketNumber} by ${user.username}`);
        const commentWithAuthor = await this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['author'],
        });
        return commentWithAuthor;
    }
    async getComments(id, user) {
        const ticket = await this.findOne(id);
        const queryBuilder = this.commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.author', 'author')
            .where('comment.ticketId = :ticketId', { ticketId: id });
        if (user.role === enums_1.UserRole.REQUESTER) {
            queryBuilder.andWhere('comment.isInternal = false');
        }
        return queryBuilder.orderBy('comment.createdAt', 'ASC').getMany();
    }
    async getStats(user) {
        const baseQuery = this.ticketRepository.createQueryBuilder('ticket');
        if (user.role === enums_1.UserRole.REQUESTER) {
            baseQuery.where('ticket.requesterId = :userId', { userId: user.id });
        }
        else if (user.role === enums_1.UserRole.AGENT) {
            baseQuery.where('ticket.assignedTo = :userId', { userId: user.id });
        }
        const [total, open, pending, resolved, resolvedToday,] = await Promise.all([
            baseQuery.clone().getCount(),
            baseQuery.clone().andWhere('ticket.status IN (:...statuses)', {
                statuses: [enums_1.TicketStatus.NEW, enums_1.TicketStatus.ASSIGNED, enums_1.TicketStatus.IN_PROGRESS],
            }).getCount(),
            baseQuery.clone().andWhere('ticket.status = :status', { status: enums_1.TicketStatus.PENDING }).getCount(),
            baseQuery.clone().andWhere('ticket.status IN (:...statuses)', {
                statuses: [enums_1.TicketStatus.RESOLVED, enums_1.TicketStatus.CLOSED],
            }).getCount(),
            baseQuery.clone()
                .andWhere('ticket.resolvedAt >= :today', { today: new Date().toISOString().split('T')[0] })
                .getCount(),
        ]);
        return {
            total,
            open,
            pending,
            resolved,
            resolvedToday,
        };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = TicketsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __param(1, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map