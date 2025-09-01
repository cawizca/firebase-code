export interface UserProfile {
  id: string;
  username: string;
  interests: string[];
  is_online: boolean;
  is_searching: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  username: string;
  interests: string[];
}

export interface UpdateUserDto {
  username?: string;
  interests?: string[];
  is_online?: boolean;
  is_searching?: boolean;
}