import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';


@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto,
    @User() user : IUser,
    
  ) {
    return this.promotionsService.create(createPromotionDto,
      user
      );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto,
  @User() user : IUser) {
    return this.promotionsService.update(id, updatePromotionDto,user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user : IUser) {
    return this.promotionsService.remove(id, user);
  }

  // @Get()
  // @ResponseMessage('Fetch all Promotion ')
  // pagination(
  //   @Query() pageOptionsDto: PromotionsPageOptionsDto,
  //   @Query('limit') limit: string,
  //   @Query() q: string,) {
    
  //   return this.promotionsService.findAll(pageOptionsDto);
  // }

  @Public()
  @Get()
  @ResponseMessage('Fetch all Promotion ')
  pagination(
    @Query('current') currentPage: string,
    @Query('pageSize') pageSize: string,
    @Query() qs: string,) {
    
    return this.promotionsService.findAll(+currentPage, +pageSize, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Fetch a Film by id')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }
}
