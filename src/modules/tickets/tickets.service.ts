import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { Comment } from './entities/comment.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TicketStatus, UserRole, Priority } from '../../common/enums';
import { User } from '../users/entities/user.entity';

interface FindAllOptions {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: Priority;
  assignedTo?: string;
  requesterId?: string;
  search?: string;
}

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private ticketCounter = 0;

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {
    this.initializeCounter();
  }

  private async initializeCounter() {
    const lastTicket = await this.ticketRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });
    if (lastTicket) {
      const num = parseInt(lastTicket.ticketNumber.replace('TKT-', ''), 10);
      this.ticketCounter = num;
    }
  }

  private generateTicketNumber(): string {
    this.ticketCounter++;
    return `TKT-${String(this.ticketCounter).padStart(5, '0')}`;
  }

  async create(createTicketDto: CreateTicketDto, user: User): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      ticketNumber: this.generateTicketNumber(),
      requesterId: user.id,
      status: TicketStatus.NEW,
    });

    const savedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Ticket created: ${savedTicket.ticketNumber} by ${user.username}`);

    return this.findOne(savedTicket.id);
  }

  async findAll(options: FindAllOptions = {}, user: User) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const { status, priority, assignedTo, requesterId, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.requester', 'requester')
      .leftJoinAndSelect('ticket.assignee', 'assignee')
      .leftJoinAndSelect('ticket.category', 'category');

    // Role-based filtering
    if (user.role === UserRole.REQUESTER) {
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
      queryBuilder.andWhere(
        '(ticket.title ILIKE :search OR ticket.ticketNumber ILIKE :search OR ticket.description ILIKE :search)',
        { search: `%${search}%` },
      );
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

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['requester', 'assignee', 'category', 'comments', 'comments.author', 'attachments'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async findByTicketNumber(ticketNumber: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketNumber },
      relations: ['requester', 'assignee', 'category', 'comments', 'comments.author', 'attachments'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketNumber} not found`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, user: User): Promise<Ticket> {
    const ticket = await this.findOne(id);

    // Check permissions
    if (user.role === UserRole.REQUESTER && ticket.requesterId !== user.id) {
      throw new ForbiddenException('You can only update your own tickets');
    }

    // Apply DTO updates to ticket
    Object.assign(ticket, updateTicketDto);

    // Track status changes
    if (updateTicketDto.status && updateTicketDto.status !== ticket.status) {
      if (updateTicketDto.status === TicketStatus.RESOLVED) {
        ticket.resolvedAt = new Date();
      }
      if (updateTicketDto.status === TicketStatus.CLOSED) {
        ticket.closedAt = new Date();
      }
    }

    // Track assignment
    if (updateTicketDto.assignedTo && !ticket.assignedTo) {
      ticket.status = TicketStatus.ASSIGNED;
    }

    await this.ticketRepository.save(ticket);

    this.logger.log(`Ticket updated: ${ticket.ticketNumber} by ${user.username}`);
    return this.findOne(id);
  }

  async assign(id: string, assignedTo: string, user: User): Promise<Ticket> {
    const ticket = await this.findOne(id);

    ticket.assignedTo = assignedTo;
    if (ticket.status === TicketStatus.NEW) {
      ticket.status = TicketStatus.ASSIGNED;
    }

    await this.ticketRepository.save(ticket);
    this.logger.log(`Ticket ${ticket.ticketNumber} assigned to ${assignedTo} by ${user.username}`);

    return this.findOne(id);
  }

  async addComment(id: string, createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const ticket = await this.findOne(id);

    // Check permissions for internal comments
    if (createCommentDto.isInternal && user.role === UserRole.REQUESTER) {
      throw new ForbiddenException('Requesters cannot create internal comments');
    }

    // Track first response
    if (!ticket.firstResponseAt && user.role !== UserRole.REQUESTER) {
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

    return commentWithAuthor!;
  }

  async getComments(id: string, user: User): Promise<Comment[]> {
    const ticket = await this.findOne(id);

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.ticketId = :ticketId', { ticketId: id });

    // Hide internal comments from requesters
    if (user.role === UserRole.REQUESTER) {
      queryBuilder.andWhere('comment.isInternal = false');
    }

    return queryBuilder.orderBy('comment.createdAt', 'ASC').getMany();
  }

  async getStats(user: User) {
    const baseQuery = this.ticketRepository.createQueryBuilder('ticket');

    if (user.role === UserRole.REQUESTER) {
      baseQuery.where('ticket.requesterId = :userId', { userId: user.id });
    } else if (user.role === UserRole.AGENT) {
      baseQuery.where('ticket.assignedTo = :userId', { userId: user.id });
    }

    const [
      total,
      open,
      pending,
      resolved,
      resolvedToday,
    ] = await Promise.all([
      baseQuery.clone().getCount(),
      baseQuery.clone().andWhere('ticket.status IN (:...statuses)', {
        statuses: [TicketStatus.NEW, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS],
      }).getCount(),
      baseQuery.clone().andWhere('ticket.status = :status', { status: TicketStatus.PENDING }).getCount(),
      baseQuery.clone().andWhere('ticket.status IN (:...statuses)', {
        statuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
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
}
