import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { Comment } from './entities/comment.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TicketStatus, Priority } from '../../common/enums';
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
export declare class TicketsService {
    private readonly ticketRepository;
    private readonly commentRepository;
    private readonly logger;
    private ticketCounter;
    constructor(ticketRepository: Repository<Ticket>, commentRepository: Repository<Comment>);
    private initializeCounter;
    private generateTicketNumber;
    create(createTicketDto: CreateTicketDto, user: User): Promise<Ticket>;
    findAll(options: FindAllOptions | undefined, user: User): Promise<{
        data: Ticket[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Ticket>;
    findByTicketNumber(ticketNumber: string): Promise<Ticket>;
    update(id: string, updateTicketDto: UpdateTicketDto, user: User): Promise<Ticket>;
    assign(id: string, assignedTo: string, user: User): Promise<Ticket>;
    addComment(id: string, createCommentDto: CreateCommentDto, user: User): Promise<Comment>;
    getComments(id: string, user: User): Promise<Comment[]>;
    getStats(user: User): Promise<{
        total: number;
        open: number;
        pending: number;
        resolved: number;
        resolvedToday: number;
    }>;
}
export {};
