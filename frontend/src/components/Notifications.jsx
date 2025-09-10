import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Função para buscar notificações
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      
      // Atualizar contador de não lidas
      const countResponse = await axios.get('/api/notifications/unread-count');
      setUnreadCount(countResponse.data.count);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar notificações quando o componente montar
  useEffect(() => {
    fetchNotifications();
    
    // Configurar polling para atualizar notificações a cada 30 segundos
    const interval = setInterval(() => {
      if (!isOpen) { // Só atualiza se o popover estiver fechado
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Atualizar quando o popover abrir
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Função para marcar notificação como lida
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      
      // Atualizar estado local
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
      
      // Atualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Função para marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      
      // Atualizar estado local
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas.",
      });
    }
  };

  // Função para excluir notificação
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      
      // Atualizar estado local
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Atualizar contador se necessário
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir a notificação.",
      });
    }
  };

  // Função para excluir todas as notificações
  const deleteAllNotifications = async () => {
    try {
      await axios.delete('/api/notifications');
      
      // Atualizar estado local
      setNotifications([]);
      setUnreadCount(0);
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram excluídas.",
      });
    } catch (error) {
      console.error('Erro ao excluir todas notificações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir as notificações.",
      });
    }
  };

  // Função para navegar para o conteúdo relacionado à notificação
  const handleNotificationClick = (notification) => {
    // Marcar como lida
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navegar com base no tipo de notificação
    switch (notification.type) {
      case 'FRIEND_REQUEST':
        // Navegar para página de solicitações de amizade
        window.location.href = '/friends/requests';
        break;
      case 'FRIEND_ACCEPT':
        // Navegar para perfil do amigo
        window.location.href = `/profile/${notification.sender.id}`;
        break;
      case 'POST_LIKE':
      case 'POST_COMMENT':
      case 'POST_SHARE':
        // Navegar para o post
        window.location.href = `/post/${notification.reference_id}`;
        break;
      case 'COMMENT_LIKE':
        // Navegar para o post que contém o comentário
        window.location.href = `/post/${notification.reference_id}`;
        break;
      default:
        // Comportamento padrão
        break;
    }
    
    // Fechar popover
    setIsOpen(false);
  };

  // Renderizar ícone de notificação com base no tipo
  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPT':
        return <div className="bg-blue-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>;
      case 'POST_LIKE':
        return <div className="bg-red-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg></div>;
      case 'POST_COMMENT':
      case 'COMMENT_LIKE':
        return <div className="bg-green-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>;
      case 'POST_SHARE':
        return <div className="bg-purple-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg></div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-full"><Bell className="h-4 w-4 text-gray-500" /></div>;
    }
  };

  // Formatar tempo relativo
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Data desconhecida';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} title="Marcar todas como lidas">
                <Check className="h-4 w-4" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={deleteAllNotifications} title="Excluir todas">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                  <div className="flex gap-3" onClick={() => handleNotificationClick(notification)}>
                    <div className="flex-shrink-0">
                      {renderNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTime(notification.created_at)}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 -mt-1 -mr-1" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {notification !== notifications[notifications.length - 1] && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Nenhuma notificação</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;