import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Edit, MessageCircle, UserPlus, MoreHorizontal, MapPin, Briefcase, GraduationCap, Heart, Calendar, Phone, Mail, Globe, Users, Image, Video, Star, CheckCircle2, Clock, Plus, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { useToast } from '../hooks/use-toast';
import Post from './Post';
import ProfileEdit from './ProfileEdit';
import FriendsList from './FriendsList';
import axios from 'axios';

const ProfileEnhanced = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null);
  const [friendRequestId, setFriendRequestId] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [photos, setPhotos] = useState([]);

  // Buscar dados do perfil
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Verificar se é o perfil do usuário atual
        const currentUserResponse = await axios.get('/api/users/me');
        const currentUser = currentUserResponse.data;
        const isOwnProfile = !userId || userId === currentUser._id;
        setIsCurrentUser(isOwnProfile);
        
        // Buscar dados do perfil (próprio ou de outro usuário)
        const profileResponse = await axios.get(
          isOwnProfile ? '/api/users/me' : `/api/users/${userId}`
        );
        setUserInfo(profileResponse.data);
        
        // Se não for o próprio perfil, verificar status de amizade
        if (!isOwnProfile) {
          try {
            const friendStatusResponse = await axios.get(`/api/friends/status/${userId}`);
            setFriendStatus(friendStatusResponse.data.status);
            if (friendStatusResponse.data.request_id) {
              setFriendRequestId(friendStatusResponse.data.request_id);
            }
            
            // Buscar amigos em comum
            const mutualFriendsResponse = await axios.get(`/api/friends/mutual/${userId}`);
            setMutualFriends(mutualFriendsResponse.data);
          } catch (error) {
            console.error('Erro ao verificar status de amizade:', error);
          }
        }
        
        // Buscar posts do usuário
        const postsResponse = await axios.get(
          isOwnProfile ? '/api/posts/me' : `/api/posts/user/${userId}`
        );
        setUserPosts(postsResponse.data);
        
        // Buscar fotos do usuário
        const photosResponse = await axios.get(
          isOwnProfile ? '/api/posts/me/photos' : `/api/posts/user/${userId}/photos`
        );
        setPhotos(photosResponse.data);
        
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados do perfil.",
        });
        // Redirecionar para a página inicial em caso de erro
        if (error.response && error.response.status === 404) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [userId, navigate, toast]);

  // Função para enviar solicitação de amizade
  const handleSendFriendRequest = async () => {
    try {
      await axios.post(`/api/friends/request/${userId}`);
      setFriendStatus('pending_sent');
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de amizade foi enviada.",
      });
    } catch (error) {
      console.error('Erro ao enviar solicitação de amizade:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar a solicitação de amizade.",
      });
    }
  };

  // Função para aceitar solicitação de amizade
  const handleAcceptFriendRequest = async () => {
    try {
      await axios.put(`/api/friends/request/${friendRequestId}/accept`);
      setFriendStatus('friends');
      toast({
        title: "Solicitação aceita",
        description: "Vocês agora são amigos.",
      });
    } catch (error) {
      console.error('Erro ao aceitar solicitação de amizade:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível aceitar a solicitação de amizade.",
      });
    }
  };

  // Função para recusar solicitação de amizade
  const handleRejectFriendRequest = async () => {
    try {
      await axios.put(`/api/friends/request/${friendRequestId}/reject`);
      setFriendStatus('none');
      toast({
        title: "Solicitação recusada",
        description: "A solicitação de amizade foi recusada.",
      });
    } catch (error) {
      console.error('Erro ao recusar solicitação de amizade:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível recusar a solicitação de amizade.",
      });
    }
  };

  // Função para cancelar solicitação de amizade
  const handleCancelFriendRequest = async () => {
    try {
      await axios.delete(`/api/friends/request/${friendRequestId}`);
      setFriendStatus('none');
      toast({
        title: "Solicitação cancelada",
        description: "Sua solicitação de amizade foi cancelada.",
      });
    } catch (error) {
      console.error('Erro ao cancelar solicitação de amizade:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível cancelar a solicitação de amizade.",
      });
    }
  };

  // Função para remover amizade
  const handleRemoveFriend = async () => {
    try {
      await axios.delete(`/api/friends/${userId}`);
      setFriendStatus('none');
      toast({
        title: "Amizade removida",
        description: "A amizade foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover amizade:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover a amizade.",
      });
    }
  };

  const handleEditProfile = (updatedData) => {
    // Recarregar dados do perfil após edição
    const fetchUpdatedProfile = async () => {
      try {
        const response = await axios.get('/api/users/me');
        setUserInfo(response.data);
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      }
    };
    
    fetchUpdatedProfile();
  };

  // Renderizar botão de ação de amizade com base no status
  const renderFriendActionButton = () => {
    if (isCurrentUser) return null;
    
    switch (friendStatus) {
      case 'friends':
        return (
          <Button 
            variant="outline" 
            onClick={handleRemoveFriend}
          >
            <Users className="h-4 w-4 mr-2" />
            Amigos
          </Button>
        );
      case 'pending_sent':
        return (
          <Button 
            variant="outline" 
            onClick={handleCancelFriendRequest}
          >
            <Clock className="h-4 w-4 mr-2" />
            Cancelar Solicitação
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex space-x-2">
            <Button 
              onClick={handleAcceptFriendRequest}
              className="bg-[#1877f2] hover:bg-[#166fe5] text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aceitar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRejectFriendRequest}
            >
              Recusar
            </Button>
          </div>
        );
      default:
        return (
          <Button 
            onClick={handleSendFriendRequest}
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Amigo
          </Button>
        );
    }
  };
  
  const profileTabs = [
    { id: 'posts', label: 'Posts', count: userPosts?.length || 0 },
    { id: 'about', label: 'About' },
    { id: 'friends', label: 'Friends', count: userInfo?.friends_count || 0 },
    { id: 'photos', label: 'Photos', count: photos?.length || 0 },
    { id: 'achievements', label: 'Conquistas' },
  ];

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Skeleton para foto de capa */}
          <Skeleton className="h-[350px] w-full rounded-md mb-6" />
          
          <div className="flex items-end space-x-5 mb-6">
            {/* Skeleton para foto de perfil */}
            <Skeleton className="h-[168px] w-[168px] rounded-full" />
            
            <div className="flex-grow">
              {/* Skeleton para nome e informações */}
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          {/* Skeleton para abas */}
          <div className="flex space-x-4 mb-6">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          
          {/* Skeleton para conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cover Photo & Profile Info */}
      <Card className="mb-6 overflow-hidden">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-80 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden">
            <img
              src={userInfo?.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            {isCurrentUser && (
              <Button className="absolute bottom-4 right-4 bg-white text-gray-900 hover:bg-gray-100">
                <Camera className="h-4 w-4 mr-2" />
                Atualizar foto de capa
              </Button>
            )}
          </div>

          {/* Profile Picture & Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6 -mt-16 relative z-10">
              {/* Profile Picture */}
              <div className="relative mb-4 lg:mb-0">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                  <AvatarFallback className="text-2xl">{userInfo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
                    Online
                  </Badge>
                </div>
              </div>

              {/* Name & Stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{userInfo.name}</h1>
                  <Badge className="bg-blue-100 text-blue-800">
                    ✓ Verified
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{userInfo.bio}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span><strong>{userInfo.friends}</strong> friends</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{userInfo.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined January 2020</span>
                  </div>
                </div>
                
                {/* Mutual Friends Preview */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=32&h=32&fit=crop&crop=face`} />
                        <AvatarFallback>F{i}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">12 mutual friends</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {isCurrentUser ? (
                  <>
                    <Button className="bg-[#1877f2] hover:bg-[#166fe5] text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add to story
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit profile
                    </Button>
                  </>
                ) : (
                  <>
                    {renderFriendActionButton()}
                    {friendStatus === 'friends' && (
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    )}
                  </>
                )}
                <Button variant="outline" size="sm" className="px-3">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Navigation */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              {profileTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#1877f2] data-[state=active]:border-b-2 data-[state=active]:border-[#1877f2] rounded-none flex items-center space-x-2"
                >
                  <span>{tab.label}</span>
                  {tab.count && (
                    <Badge variant="secondary" className="ml-1">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - About & Info */}
        <div className="space-y-6">
          {/* Intro */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Intro</h3>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <div className="space-y-3 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              ) : (
                <div className="space-y-3">
                  {userInfo?.bio ? (
                    <p className="text-gray-700 text-center">{userInfo.bio}</p>
                  ) : isCurrentUser ? (
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Adicione uma bio para contar mais sobre você</p>
                      <Button variant="link" className="text-[#1877f2] mt-1">
                        Adicionar bio
                      </Button>
                    </div>
                  ) : null}
                  
                  <div className="space-y-3">
                    {userInfo?.work && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>Trabalha em {userInfo.work}</span>
                      </div>
                    )}
                    {userInfo?.education && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <GraduationCap className="h-4 w-4" />
                        <span>Estudou {userInfo.education}</span>
                      </div>
                    )}
                    {userInfo?.location && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Mora em {userInfo.location}</span>
                      </div>
                    )}
                    {userInfo?.relationship && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Heart className="h-4 w-4" />
                        <span>{userInfo.relationship}</span>
                      </div>
                    )}
                    {userInfo?.birthday && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Nascido em {userInfo.birthday}</span>
                      </div>
                    )}
                    
                    {!userInfo?.work && !userInfo?.education && !userInfo?.location && 
                     !userInfo?.relationship && !userInfo?.birthday && isCurrentUser && (
                      <div className="text-center py-2">
                        <p className="text-gray-500 text-sm">Adicione detalhes sobre você</p>
                      </div>
                    )}
                  </div>

                  {isCurrentUser && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => setShowEditModal(true)}>
                      Editar detalhes
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Conquistas</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : achievements && achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="bg-[#1877f2] text-white p-2 rounded-full">
                        <achievement.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{achievement.label}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-md">
                  <Trophy className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">
                    {isCurrentUser ? "Você ainda não tem conquistas" : "Nenhuma conquista para mostrar"}
                  </p>
                  {isCurrentUser && (
                    <Button variant="link" className="text-blue-600 mt-2">
                      Adicionar conquista
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Life Events */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Eventos da Vida</h3>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : lifeEvents && lifeEvents.length > 0 ? (
                <div className="space-y-4">
                  {lifeEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <event.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{event.event}</h4>
                        <p className="text-sm text-gray-600">{event.date}</p>
                        {event.location && (
                          <p className="text-sm text-gray-500">{event.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-md">
                  <CalendarDays className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">
                    {isCurrentUser ? "Você ainda não adicionou eventos da vida" : "Nenhum evento da vida para mostrar"}
                  </p>
                </div>
              )}
              {isCurrentUser && (
                <Button variant="outline" className="w-full mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Adicionar evento da vida
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Fotos</h3>
                {photos && photos.length > 9 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#1877f2]"
                    onClick={() => navigate(`/profile/${userInfo._id}/photos`)}
                  >
                    Ver todas as fotos
                  </Button>
                )}
              </div>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-md" />
                  ))}
                </div>
              ) : photos && photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 9).map((photo, i) => (
                    <div key={photo._id || i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={photo.url || `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=150&h=150&fit=crop`} 
                        alt={photo.caption || `Foto ${i+1}`} 
                        className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-md">
                  <Camera className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">Nenhuma foto para mostrar</p>
                  {isCurrentUser && (
                    <Button variant="link" className="text-blue-600 mt-2">
                      Adicionar fotos
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friends */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Amigos</h3>
                {userInfo?.friends && userInfo.friends.length > 9 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#1877f2]"
                    onClick={() => navigate(`/profile/${userInfo._id}/friends`)}
                  >
                    Ver todos
                  </Button>
                )}
              </div>
              {!isLoading && (
                <p className="text-gray-600 text-sm mb-4">
                  {userInfo?.friends?.length || 0} amigos
                  {mutualFriends > 0 && !isCurrentUser && (
                    <span className="ml-2 text-gray-500">· {mutualFriends} em comum</span>
                  )}
                </p>
              )}
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : userInfo?.friends && userInfo.friends.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {userInfo.friends.slice(0, 9).map((friend) => (
                    <div 
                      key={friend._id} 
                      className="text-center cursor-pointer"
                      onClick={() => navigate(`/profile/${friend._id}`)}
                    >
                      <Avatar className="h-16 w-16 mx-auto mb-2">
                        <AvatarImage src={friend.profilePicture || '/images/default-avatar.png'} />
                        <AvatarFallback>{friend.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium text-gray-900 truncate">{friend.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-md">
                  <Users className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">
                    {isCurrentUser ? "Você ainda não tem amigos" : "Nenhum amigo para mostrar"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Posts */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'posts' && (
            <>
              {/* Create Post - Only show for current user */}
              {isCurrentUser && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userInfo?.profilePicture || '/images/default-avatar.png'} alt={userInfo?.name} />
                        <AvatarFallback>{userInfo?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" className="flex-1 justify-start text-gray-500 bg-gray-100 hover:bg-gray-200">
                        O que você está pensando, {userInfo?.name?.split(' ')[0]}?
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Posts */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full rounded-md" />
                    <Skeleton className="h-40 w-full rounded-md" />
                  </div>
                ) : userPosts && userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <Card key={post._id || post.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={userInfo?.profilePicture || '/images/default-avatar.png'} alt={userInfo?.name} />
                              <AvatarFallback>{userInfo?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base font-semibold">{userInfo?.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {post.createdAt ? new Date(post.createdAt).toLocaleString('pt-BR') : 'Agora'} · 
                                {post.privacy === 'public' ? (
                                  <Globe className="inline h-3 w-3" />
                                ) : post.privacy === 'friends' ? (
                                  <Users className="inline h-3 w-3" />
                                ) : (
                                  <Lock className="inline h-3 w-3" />
                                )}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Salvar post</DropdownMenuItem>
                              <DropdownMenuItem>Ocultar post</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Denunciar post</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{post.content}</p>
                        {post.image && (
                          <div className="mt-3 rounded-md overflow-hidden">
                            <img src={post.image} alt="Post" className="w-full h-auto" />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{post.likes?.length || 0} curtidas</span>
                        </div>
                        <div className="flex space-x-4">
                          <span>{post.comments?.length || 0} comentários</span>
                          <span>{post.shares || 0} compartilhamentos</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <FileQuestion className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-xl font-medium text-gray-500">Nenhuma publicação encontrada</p>
                      {isCurrentUser && (
                        <p className="text-gray-400 mt-2 text-center max-w-md">
                          Compartilhe atualizações, fotos e muito mais com seus amigos e familiares.
                        </p>
                      )}
                      {isCurrentUser && (
                        <Button className="mt-4 bg-[#1877f2] hover:bg-[#166fe5] text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Publicação
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {activeTab === 'about' && (
            <Card>
              <CardHeader>
                <CardTitle>Sobre</CardTitle>
              </CardHeader>
              {isLoading ? (
                <CardContent className="space-y-6">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              ) : (
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Informações de contato</h3>
                    <div className="space-y-2">
                      {userInfo?.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{userInfo.email}</span>
                        </div>
                      )}
                      {userInfo?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{userInfo.phone}</span>
                        </div>
                      )}
                      {!userInfo?.email && !userInfo?.phone && (
                        <div className="text-gray-500 text-sm italic">Nenhuma informação de contato disponível</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Trabalho e educação</h3>
                    <div className="space-y-2">
                      {userInfo?.work && (
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Trabalha em {userInfo.work}</span>
                        </div>
                      )}
                      {userInfo?.education && (
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Estudou em {userInfo.education}</span>
                        </div>
                      )}
                      {!userInfo?.work && !userInfo?.education && (
                        <div className="text-gray-500 text-sm italic">Nenhuma informação de trabalho ou educação disponível</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Informações pessoais</h3>
                    <div className="space-y-2">
                      {userInfo?.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Mora em {userInfo.location}</span>
                        </div>
                      )}
                      {userInfo?.relationship && (
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{userInfo.relationship}</span>
                        </div>
                      )}
                      {userInfo?.birthday && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Nascido em {userInfo.birthday}</span>
                        </div>
                      )}
                      {!userInfo?.location && !userInfo?.relationship && !userInfo?.birthday && (
                        <div className="text-gray-500 text-sm italic">Nenhuma informação pessoal disponível</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {activeTab === 'friends' && (
            <Card>
              <CardHeader>
                <CardTitle>Amigos</CardTitle>
                {!isLoading && (
                  <CardDescription>
                    {userInfo?.friends_count || 0} amigos
                    {mutualFriends.length > 0 && !isCurrentUser && (
                      <span className="ml-2 text-gray-500">· {mutualFriends.length} em comum</span>
                    )}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <Skeleton className="h-16 w-16 rounded-full mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : userInfo?.friends && userInfo.friends.length > 0 ? (
                  <FriendsList 
                    friends={userInfo.friends.slice(0, 8)} 
                    currentUserId={userId} 
                    showMutual={!isCurrentUser}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-xl font-medium text-gray-500">
                      {isCurrentUser ? "Você ainda não tem amigos" : "Nenhum amigo para mostrar"}
                    </p>
                    {isCurrentUser && (
                      <p className="text-gray-400 mt-2 text-center max-w-md">
                        Encontre pessoas que você conhece e conecte-se com elas.
                      </p>
                    )}
                    {isCurrentUser && (
                      <Button className="mt-4 bg-[#1877f2] hover:bg-[#166fe5] text-white">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Encontrar Amigos
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
              {!isLoading && userInfo?.friends && userInfo.friends.length > 8 && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/profile/${userInfo._id}/friends`)}
                  >
                    Ver todos os amigos
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <ProfileEdit
          onClose={() => setShowEditModal(false)}
          onSave={handleEditProfile}
        />
      )}
    </div>
  );
};

export default ProfileEnhanced;