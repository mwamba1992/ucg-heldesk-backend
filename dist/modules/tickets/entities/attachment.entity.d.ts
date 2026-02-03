import { User } from '../../users/entities/user.entity';
import { Ticket } from './ticket.entity';
export declare class Attachment {
    id: string;
    ticketId: string;
    ticket: Ticket;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    uploader: User;
    createdAt: Date;
}
