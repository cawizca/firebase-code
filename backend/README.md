# AnonyConnect Backend

A NestJS backend for the AnonyConnect stranger chat application with real-time messaging, user matching, and content moderation.

## Features

- **User Management**: Create and manage anonymous user profiles
- **Real-time Chat**: WebSocket-based messaging with Socket.IO
- **Smart Matching**: Interest-based user matching algorithm
- **Content Moderation**: Automatic filtering of inappropriate content
- **Safety Features**: User reporting and blocking system
- **Supabase Integration**: PostgreSQL database with Row Level Security

## Setup

1. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials in the `.env` file.

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Set up your Supabase project
   - Run the migration files in the `supabase/migrations` folder
   - Ensure RLS is enabled on all tables

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

## API Endpoints

### Users
- `POST /users` - Create a new user profile
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `PUT /users/:id/online` - Set user online status
- `PUT /users/:id/searching` - Set user searching status
- `DELETE /users/:id` - Delete user profile

### Matching
- `POST /matching/find/:userId` - Find a match for user
- `GET /matching/conversation/:conversationId/:userId` - Get conversation details
- `PUT /matching/end/:conversationId/:userId` - End a conversation

### Chat
- `POST /chat/message/:senderId` - Send a message
- `GET /chat/messages/:conversationId/:userId` - Get conversation messages
- `POST /chat/report/:reporterId` - Report a user
- `POST /chat/block/:blockerId/:blockedUserId` - Block a user

## WebSocket Events

### Client to Server
- `join` - Join the chat system
- `leave` - Leave the chat system
- `sendMessage` - Send a message
- `joinConversation` - Join a specific conversation
- `leaveConversation` - Leave a conversation

### Server to Client
- `joined` - Confirmation of joining
- `newMessage` - New message received
- `messageError` - Message sending error
- `joinedConversation` - Joined conversation confirmation
- `leftConversation` - Left conversation confirmation
- `conversationEnded` - Conversation has ended

## Database Schema

The backend uses Supabase with the following tables:
- `users` - User profiles and status
- `conversations` - Chat conversations between users
- `messages` - Individual chat messages
- `reports` - User reports for moderation
- `blocked_users` - User blocking relationships

## Security

- Row Level Security (RLS) enabled on all tables
- Content moderation for messages
- User blocking and reporting system
- Input validation and sanitization
- CORS protection

## Development

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test
```