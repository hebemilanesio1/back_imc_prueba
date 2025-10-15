import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: User;
}

@UseGuards(JwtAuthGuard)
@Controller('imc')
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  @Post('calcular')
  calcular(
    @Body(ValidationPipe) data: CalcularImcDto,
    @Req() req: AuthRequest,
  ) {
    return this.imcService.calcularImc(data, req.user);
  }

  @Get('historial')
  getHistorial(@Query() query: PaginationDto, @Req() req: AuthRequest) {
    const esDescendente = query.esDescendente ?? true;
    const skip = Number(query.skip ?? 0);
    const take = query.take ? Number(query.take) : undefined;
    return this.imcService.getHistorial(req.user, skip, take, esDescendente);
  }

  @Get('estadisticas')
  getEstadisticas(@Req() req: AuthRequest) {
    return this.imcService.getEstadisticas(req.user);
  }
}
