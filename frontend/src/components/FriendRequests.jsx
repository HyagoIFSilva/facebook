import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Users } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('received');
  const { toast } = useToast();

  // Buscar solicitações de amizade recebidas
  const fetchReceivedRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/friends/requests/received');
      setRequests(response.data);
    } catch (error) {
      console.error('Erro ao buscar solicitações de amizade:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as solicitações de amizade.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar solicitações de amizade enviadas
  const fetchSentRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/friends/requests/sent');
      setSentRequests(response.data);
    } catch (error) {
      console.error('Erro ao buscar solicitações enviadas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as solicitações enviadas.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar sugestões de amizade
  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/friends/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Erro ao buscar sugestões de amizade:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as sugestões de amizade.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando o componente montar ou quando a aba mudar
  useEffect(() => {
    if (activeTab === 'received') {
      fetchReceivedRequests();
    } else if (activeTab === 'sent') {
      fetchSentRequests();
    } else if (activeTab === 'suggestions') {
      fetchSuggestions();
    }
  }, [activeTab]);

  // Aceitar solicitação de amizade
  const acceptRequest = async (requestId) => {
    try {
      await axios.put(`/api/friends/requests/${requestId}/accept`);
      
      // Atualizar lista de solicitações
      fetchReceivedRequests();
      
      toast({
        title: "Solicitação aceita",
        description: "Vocês agora são amigos!",
      });
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível aceitar a solicitação.",
      });
    }
  };

  // Recusar solicitação de amizade
  const rejectRequest = async (requestId) => {
    try {
      await axios.put(`/api/friends/requests/${requestId}/reject`);
      
      // Atualizar lista de solicitações
      fetchReceivedRequests();
      
      toast({
        title: "Solicitação recusada",
        description: "A solicitação de amizade foi recusada.",
      });
    } catch (error) {
      console.error('Erro ao recusar solicitação:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível recusar a solicitação.",
      });
    }
  };

  // Cancelar solicitação enviada
  const cancelRequest = async (requestId) => {
    try {
      await axios.delete(`/api/friends/requests/${requestId}`);
      
      // Atualizar lista de solicitações enviadas
      fetchSentRequests();
      
      toast({
        title: "Solicitação cancelada",
        description: "A solicitação de amizade foi cancelada.",
      });
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível cancelar a solicitação.",
      });
    }
  };

  // Enviar solicitação de amizade
  const sendRequest = async (userId) => {
    try {
      await axios.post('/api/friends/requests', { recipient_id: userId });
      
      // Atualizar sugestões e solicitações enviadas
      fetchSuggestions();
      if (activeTab === 'sent') {
        fetchSentRequests();
      }
      
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de amizade foi enviada.",
      });
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar a solicitação de amizade.",
      });
    }
  };

  // Renderizar lista de solicitações recebidas
  const renderReceivedRequests = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <div className="text-center p-8">
          <UserCheck className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Você não tem solicitações de amizade pendentes.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Link to={`/profile/${request.requester.id}`} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.requester.avatar} alt={request.requester.name} />
                    <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {request.requester.name}
                      {request.requester.is_verified && (
                        <span className="ml-1 inline-flex items-center">
                          <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </span>
                      )}
                    </CardTitle>
                    {request.mutual_friends_count > 0 && (
                      <CardDescription className="text-xs">
                        {request.mutual_friends_count} {request.mutual_friends_count === 1 ? 'amigo em comum' : 'amigos em comum'}
                      </CardDescription>
                    )}
                  </div>
                </Link>
              </div>
            </CardHeader>
            <CardFooter className="pt-2">
              <div className="flex gap-2 w-full">
                <Button 
                  className="flex-1" 
                  onClick={() => acceptRequest(request.id)}
                >
                  Aceitar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => rejectRequest(request.id)}
                >
                  Recusar
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Renderizar lista de solicitações enviadas
  const renderSentRequests = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (sentRequests.length === 0) {
      return (
        <div className="text-center p-8">
          <UserPlus className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Você não enviou solicitações de amizade.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sentRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Link to={`/profile/${request.recipient.id}`} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.recipient.avatar} alt={request.recipient.name} />
                    <AvatarFallback>{request.recipient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {request.recipient.name}
                      {request.recipient.is_verified && (
                        <span className="ml-1 inline-flex items-center">
                          <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </span>
                      )}
                    </CardTitle>
                    {request.mutual_friends_count > 0 && (
                      <CardDescription className="text-xs">
                        {request.mutual_friends_count} {request.mutual_friends_count === 1 ? 'amigo em comum' : 'amigos em comum'}
                      </CardDescription>
                    )}
                  </div>
                </Link>
                <Badge variant="outline" className="text-xs">
                  Pendente
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => cancelRequest(request.id)}
              >
                Cancelar solicitação
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Renderizar sugestões de amizade
  const renderSuggestions = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (suggestions.length === 0) {
      return (
        <div className="text-center p-8">
          <Users className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Não há sugestões de amizade no momento.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {user.name}
                      {user.is_verified && (
                        <span className="ml-1 inline-flex items-center">
                          <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </span>
                      )}
                    </CardTitle>
                    {user.mutual_friends_count > 0 && (
                      <CardDescription className="text-xs">
                        {user.mutual_friends_count} {user.mutual_friends_count === 1 ? 'amigo em comum' : 'amigos em comum'}
                      </CardDescription>
                    )}
                  </div>
                </Link>
              </div>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button 
                className="w-full" 
                onClick={() => sendRequest(user.id)}
              >
                Adicionar amigo
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Amigos</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received" className="relative">
            Solicitações
            {requests.length > 0 && (
              <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">
            Enviadas
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            Sugestões
          </TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-4">
          {renderReceivedRequests()}
        </TabsContent>
        <TabsContent value="sent" className="mt-4">
          {renderSentRequests()}
        </TabsContent>
        <TabsContent value="suggestions" className="mt-4">
          {renderSuggestions()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendRequests;