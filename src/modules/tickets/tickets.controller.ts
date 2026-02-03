import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, TicketStatus, Priority } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: User) {
    return this.ticketsService.create(createTicketDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiQuery({ name: 'priority', required: false, enum: Priority })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Tickets list retrieved' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: Priority,
    @Query('assignedTo') assignedTo?: string,
    @Query('search') search?: string,
  ) {
    return this.ticketsService.findAll(
      { page, limit, status, priority, assignedTo, search },
      user,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  getStats(@CurrentUser() user: User) {
    return this.ticketsService.getStats(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket found' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser() user: User,
  ) {
    return this.ticketsService.update(id, updateTicketDto, user);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.AGENT)
  @ApiOperation({ summary: 'Assign ticket to an agent' })
  @ApiResponse({ status: 200, description: 'Ticket assigned successfully' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignTicketDto: AssignTicketDto,
    @CurrentUser() user: User,
  ) {
    return this.ticketsService.assign(id, assignTicketDto.assignedTo, user);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get ticket comments' })
  @ApiResponse({ status: 200, description: 'Comments retrieved' })
  getComments(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.ticketsService.getComments(id, user);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to ticket' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.ticketsService.addComment(id, createCommentDto, user);
  }
}
