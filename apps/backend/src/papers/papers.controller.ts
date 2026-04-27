/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// PURPOSE: HTTP routes for /api/papers/*.
//
// ROUTE ORDERING IS CRITICAL IN NESTJS:
// NestJS matches routes top to bottom. Specific routes must come
// BEFORE parameterized routes. For example:
//   GET /papers/published  → must be defined BEFORE GET /papers/:id
//   GET /papers/my-submissions → must be BEFORE GET /papers/:id
// Otherwise 'published' and 'my-submissions' get treated as :id values.

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PapersService } from './papers.service';
import {
  CreatePaperDto,
  PaperQueryDto,
  SubmitRevisionDto,
  UpdatePaperDto,
  UpdateStatusDto,
} from './dto/paper.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { Role } from '../common/enums/role.enum';

@Controller('papers')
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  // ─── PUBLIC ROUTES (no auth required) ─────────────────────────────────────

  // GET /api/papers/published
  // Anyone can browse published papers — no token needed
  @Get('published')
  getPublishedPapers(@Query() query: PaperQueryDto) {
    return this.papersService.getPublishedPapers(query);
  }

  // ─── AUTHOR ROUTES ─────────────────────────────────────────────────────────

  // POST /api/papers
  // Author creates a new paper (saves as draft)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @Post()
  createPaper(@Body() dto: CreatePaperDto, @Request() req) {
    return this.papersService.createPaper(dto, req.user.userId, req.user.email);
  }

  // GET /api/papers/my-submissions
  // Author sees all their own papers with current status
  // MUST be before /:id route
  @UseGuards(JwtAuthGuard)
  @Get('my-submissions')
  getMySubmissions(@Request() req) {
    return this.papersService.getMySubmissions(req.user.userId);
  }

  // POST /api/papers/:id/submit
  // Author explicitly submits a draft paper
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @Post(':id/submit')
  submitPaper(@Param('id') id: string, @Request() req) {
    return this.papersService.submitPaper(id, req.user.userId);
  }

  // POST /api/papers/:id/revision
  // Author submits revised version after revision request
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @Post(':id/revision')
  submitRevision(
    @Param('id') id: string,
    @Body() dto: SubmitRevisionDto,
    @Request() req,
  ) {
    return this.papersService.submitRevision(id, dto, req.user.userId);
  }

  // PATCH /api/papers/:id
  // Author updates a draft paper
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR)
  @Patch(':id')
  updatePaper(
    @Param('id') id: string,
    @Body() dto: UpdatePaperDto,
    @Request() req,
  ) {
    return this.papersService.updatePaper(id, dto, req.user.userId);
  }

  // DELETE /api/papers/:id
  // Author deletes a draft paper
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePaper(@Param('id') id: string, @Request() req) {
    return this.papersService.deletePaper(id, req.user.userId, req.user.role);
  }

  // ─── EDITOR / ADMIN ROUTES ─────────────────────────────────────────────────

  // GET /api/papers
  // Editor sees all papers with filtering and pagination
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  @Get()
  getAllPapers(@Query() query: PaperQueryDto) {
    return this.papersService.getAllPapers(query);
  }

  // PATCH /api/papers/:id/status
  // Editor moves paper through the workflow
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.papersService.updateStatus(id, dto, req.user.userId);
  }

  // ─── SHARED ROUTES ─────────────────────────────────────────────────────────

  // GET /api/papers/:id
  // MUST be last — catches all /:id patterns
  // Returns different data based on role (author vs editor vs public)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getPaperById(@Param('id') id: string, @Request() req) {
    return this.papersService.getPaperById(id, req.user.userId, req.user.role);
  }
}
