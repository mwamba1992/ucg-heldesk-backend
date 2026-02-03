import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTicketDto {
  @ApiProperty({ description: 'User ID to assign the ticket to' })
  @IsUUID()
  @IsNotEmpty()
  assignedTo: string;
}
