import React, { useState, useEffect } from 'react';
import { Users, Search, UserMinus } from 'lucide-react';
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
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";

const FriendsList = ({ userId }) => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const { toast } = useToast();

  // Buscar amigos do usuário
  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/friends/${userId || 'me'}`);
      setFriends(response.data);
      setFilteredFriends(response.data);
    } catch (error) {
      console.error('Erro ao buscar amigos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de amigos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar amigos quando o componente montar ou quando o userId mudar
  useEffect(() => {
    fetchFriends();
  }, [userId]);

  // Filtrar amigos quando a busca mudar
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = friends.filter(friend => 
        friend.name.toLowerCase().includes(query) ||
        (friend.location && friend.location.toLowerCase().includes(query))
      );
      setFilteredFriends(filtered);
    }
  }, [searchQuery, friends]);

  // Remover amizade
  const removeFriend = async () => {
    if (!friendToRemove) return;
    
    try {
      await axios.delete(`/api/friends/${friendToRemove.id}`);
      
      // Atualizar lista de amigos
      setFriends(friends.filter(friend => friend.id !== friendToRemove.id));
      
      toast({
        title: "Amizade removida",
        description: `Você não é mais amigo de ${friendToRemove.name}.`,
      });
      
      // Fechar diálogo e limpar estado
      setShowRemoveDialog(false);
      setFriendToRemove(null);
    } catch (error) {
      console.error('Erro ao remover amizade:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover a amizade.",
      });
    }
  };

  // Abrir diálogo de confirmação para remover amizade
  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend);
    setShowRemoveDialog(true);
  };

  // Renderizar lista de amigos
  const renderFriendsList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (friends.length === 0) {
      return (
        <div className="text-center p-8">
          <Users className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Nenhum amigo encontrado.</p>
        </div>
      );
    }

    if (filteredFriends.length === 0) {
      return (
        <div className="text-center p-8">
          <Search className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Nenhum amigo encontrado com "{searchQuery}".</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFriends.map((friend) => (
          <Card key={friend.id} className="overflow-hidden">
            <Link to={`/profile/${friend.id}`}>
              <div className="h-32 bg-gray-100 relative">
                {friend.cover_photo ? (
                  <img 
                    src={friend.cover_photo} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
            </Link>
            <CardHeader className="pt-0">
              <div className="flex justify-center -mt-10">
                <Link to={`/profile/${friend.id}`}>
                  <Avatar className="h-20 w-20 border-4 border-white">
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
              </div>
              <div className="text-center mt-2">
                <Link to={`/profile/${friend.id}`}>
                  <CardTitle className="text-lg flex items-center justify-center">
                    {friend.name}
                    {friend.is_verified && (
                      <span className="ml-1 inline-flex items-center">
                        <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      </span>
                    )}
                  </CardTitle>
                </Link>
                {friend.location && (
                  <CardDescription className="text-sm">
                    {friend.location}
                  </CardDescription>
                )}
                {friend.mutual_friends_count > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {friend.mutual_friends_count} {friend.mutual_friends_count === 1 ? 'amigo em comum' : 'amigos em comum'}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardFooter className="flex justify-center pb-4">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveFriend(friend);
                }}
              >
                <UserMinus className="h-3 w-3 mr-1" />
                Desfazer amizade
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
        <Badge variant="outline">{friends.length}</Badge>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar amigos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {renderFriendsList()}
      
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover amizade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {friendToRemove?.name} da sua lista de amigos?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={removeFriend}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendsList;