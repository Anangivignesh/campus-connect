import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { MOCK_USERS } from '@/data/mockData';

export default function ChatsPage() {
  const { chatId } = useParams();
  const user = useAuthStore((s) => s.user);
  const { chats, messages, activeChatId, setActiveChat, sendMessage, searchQuery, setSearchQuery } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChatId = chatId ?? activeChatId;

  useEffect(() => {
    if (chatId) setActiveChat(chatId);
  }, [chatId, setActiveChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatId, messages]);

  const activeChat = chats.find((c) => c.id === currentChatId);
  const chatMessages = currentChatId ? (messages[currentChatId] || []) : [];

  const getChatName = (chat: typeof chats[0]) => {
    if (chat.type === 'group') return chat.name ?? 'Group';
    const otherId = chat.members.find((m) => m.user_id !== user?.id)?.user_id;
    return MOCK_USERS.find((u) => u.id === otherId)?.name ?? 'Unknown';
  };

  const handleSend = () => {
    if (!newMessage.trim() || !currentChatId || !user) return;
    sendMessage(currentChatId, newMessage.trim(), user.id);
    setNewMessage('');
  };

  const filteredChats = chats.filter((c) => {
    if (!searchQuery) return true;
    const name = getChatName(c).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 lg:-m-6 border border-border rounded-lg overflow-hidden">
      {/* Chat List */}
      <div className={cn(
        'w-full sm:w-80 border-r border-border flex flex-col bg-card',
        currentChatId ? 'hidden sm:flex' : 'flex'
      )}>
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg">Chats</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 text-left hover:bg-accent transition-colors border-b border-border/50',
                currentChatId === chat.id && 'bg-accent'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-sm font-bold">{getChatName(chat).charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{getChatName(chat)}</p>
                  {chat.unread_count > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {chat.last_message?.content ?? 'No messages yet'}
                </p>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className={cn(
        'flex-1 flex flex-col',
        !currentChatId ? 'hidden sm:flex' : 'flex'
      )}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-border flex items-center px-4 gap-3">
              <Button
                variant="ghost" size="sm"
                className="sm:hidden"
                onClick={() => setActiveChat(null)}
              >
                ←
              </Button>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">{getChatName(activeChat).charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{getChatName(activeChat)}</p>
                <p className="text-xs text-muted-foreground">
                  {activeChat.type === 'group'
                    ? `${activeChat.members.length} members`
                    : 'Online'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  const sender = MOCK_USERS.find((u) => u.id === msg.sender_id);
                  return (
                    <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2',
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      )}>
                        {!isMine && activeChat.type === 'group' && (
                          <p className="text-xs font-medium mb-1 opacity-70">{sender?.name}</p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <div className={cn('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start')}>
                          <span className="text-[10px] opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric', minute: '2-digit',
                            })}
                          </span>
                          {isMine && (
                            <span className="text-xs">
                              {msg.status === 'read' ? '🔵' : '⚪'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
