import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../types/user.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Put(':id/online')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setOnlineStatus(@Param('id') id: string, @Body('isOnline') isOnline: boolean) {
    return this.usersService.setUserOnlineStatus(id, isOnline);
  }

  @Put(':id/searching')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setSearchingStatus(@Param('id') id: string, @Body('isSearching') isSearching: boolean) {
    return this.usersService.setUserSearchingStatus(id, isSearching);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}