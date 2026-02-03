import { Priority } from '../../../common/enums';
export declare class CreateTicketDto {
    title: string;
    description?: string;
    categoryId?: string;
    priority?: Priority;
    location?: string;
}
