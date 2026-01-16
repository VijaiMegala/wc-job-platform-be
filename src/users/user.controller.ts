import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('candidate')
  createCandidate(@Body() createCandidateDto: CreateCandidateDto) {
    return this.userService.createCandidate(createCandidateDto);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('userId') userId: string) {
    return this.userService.findOne(userId);
  }
}

