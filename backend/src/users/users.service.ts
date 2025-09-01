import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserProfile, CreateUserDto, UpdateUserDto } from '../types/user.types';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserProfile> {
    const supabase = this.supabaseService.getAdminClient();
    
    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', createUserDto.username)
      .single();

    if (existingUser) {
      throw new BadRequestException('Username already taken');
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        username: createUserDto.username,
        interests: createUserDto.interests,
        is_online: true,
        is_searching: false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to create user');
    }

    return data;
  }

  async getUserById(id: string): Promise<UserProfile> {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserProfile> {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updateUserDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found or update failed');
    }

    return data;
  }

  async setUserOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    
    await supabase
      .from('users')
      .update({ 
        is_online: isOnline,
        is_searching: isOnline ? false : false, // Stop searching when going offline
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  async setUserSearchingStatus(id: string, isSearching: boolean): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    
    await supabase
      .from('users')
      .update({ 
        is_searching: isSearching,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  async deleteUser(id: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }
}