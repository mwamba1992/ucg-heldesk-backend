import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { TicketStatus, Priority } from '../../common/enums';
import { User } from '../users/entities/user.entity';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto, user: User): Promise<import("./entities/ticket.entity").Ticket>;
    findAll(user: User, page?: number, limit?: number, status?: TicketStatus, priority?: Priority, assignedTo?: string, search?: string): Promise<{
        data: import("./entities/ticket.entity").Ticket[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(user: User): Promise<{
        total: number;
        open: number;
        pending: number;
        resolved: number;
        resolvedToday: number;
    }>;
    findOne(id: string): Promise<import("./entities/ticket.entity").Ticket>;
    update(id: string, updateTicketDto: UpdateTicketDto, user: User): Promise<import("./entities/ticket.entity").Ticket>;
    assign(id: string, assignTicketDto: AssignTicketDto, user: User): Promise<import("./entities/ticket.entity").Ticket>;
    getComments(id: string, user: User): Promise<import("./entities/comment.entity").Comment[]>;
    addComment(id: string, createCommentDto: CreateCommentDto, user: User): Promise<import("./entities/comment.entity").Comment>;
}
