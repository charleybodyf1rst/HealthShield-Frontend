// Team messaging types - encrypted end-to-end

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  createdBy: string;
  lastMessageAt?: string;
  lastReadAt?: string;
  unreadCount: number;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  notificationSettings?: {
    push: boolean;
    email: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: string;
  isOnline?: boolean;
  lastSeenAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'system';
  // Encrypted content - decrypted on client side
  encryptedContent: string;
  iv: string;
  // Optional attachment
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  attachmentSize?: number;
  // Reactions
  reactions: MessageReaction[];
  // Read receipts
  readReceipts: MessageReadReceipt[];
  // Timestamps
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  deletedAt?: string;
}

export interface MessageSender {
  id: string;
  name: string;
  avatar?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface MessageReadReceipt {
  userId: string;
  userName: string;
  readAt: string;
}

// Encryption helpers
export interface EncryptedPayload {
  encryptedContent: string;
  iv: string;
}

export interface DecryptedMessage extends Omit<Message, 'encryptedContent' | 'iv'> {
  content: string;
}

// API response types
export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
}

export interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Message[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface SendMessagePayload {
  messageType: 'text' | 'image' | 'file' | 'voice';
  encryptedContent: string;
  iv: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  attachmentSize?: number;
}

export interface CreateConversationPayload {
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  participantIds: string[];
}
