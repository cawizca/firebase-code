import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { MatchingModule } from './matching/matching.module';
import { ModerationModule } from './moderation/moderation.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    UsersModule,
    ChatModule,
    MatchingModule,
    ModerationModule,
  ],
})
export class AppModule {}