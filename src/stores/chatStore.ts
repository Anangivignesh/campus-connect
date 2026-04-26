import { create } from 'zustand';
import type { Chat, Message, Profile } from '@/types';
import { MOCK_CHATS, MOCK_MESSAGES, MOCK_USERS } from '@/data/mockData';

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  users: Profile[];
  activeChatId: string | null;
  typingUsers: Record<string, string[]>;
  searchQuery: string;
  setActiveChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string, senderId: string) => void;
  markAsRead: (chatId: string, userId: string) => void;
  setSearchQuery: (query: string) => void;
  pinMessage: (chatId: string, messageId: string) => void;
  createGroup: (name: string, memberIds: string[], creatorId: string) => void;
}

// Group messages by chat
const groupedMessages: Record<string, Message[]> = {};
for (const msg of MOCK_MESSAGES) {
  if (!groupedMessages[msg.chat_id]) groupedMessages[msg.chat_id] = [];
  groupedMessages[msg.chat_id].push(msg);
}

export const useChatStore = create<ChatState>((set) => ({
  chats: MOCK_CHATS,
  messages: groupedMessages,
  users: MOCK_USERS,
  activeChatId: null,
  typingUsers: {},
  searchQuery: '',

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  sendMessage: (chatId, content, senderId) => {
    const newMsg: Message = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      chat_id: chatId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
      status: 'sent',
      read_by: [],
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), newMsg],
      },
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, last_message: newMsg } : c
      ),
    }));
  },

  markAsRead: (chatId, userId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.sender_id !== userId && !m.read_by.includes(userId)
            ? { ...m, status: 'read' as const, read_by: [...m.read_by, userId] }
            : m
        ),
      },
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, unread_count: 0 } : c
      ),
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  pinMessage: (chatId, messageId) => {
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, pinned_message_id: messageId } : c
      ),
    }));
  },

  createGroup: (name, memberIds, creatorId) => {
    const newChat: Chat = {
      id: `c_${Date.now()}`,
      type: 'group',
      name,
      created_by: creatorId,
      created_at: new Date().toISOString(),
      members: memberIds.map((uid) => ({
        chat_id: `c_${Date.now()}`,
        user_id: uid,
        joined_at: new Date().toISOString(),
        role: uid === creatorId ? 'admin' as const : 'member' as const,
        is_live_viewing: false,
      })),
      unread_count: 0,
    };
    set((state) => ({
      chats: [newChat, ...state.chats],
      messages: { ...state.messages, [newChat.id]: [] },
    }));
  },
}));
