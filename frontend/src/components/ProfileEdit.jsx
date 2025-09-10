import React, { useState, useEffect } from 'react';
import { Save, X, Camera, MapPin, Briefcase, GraduationCap, Heart, Calendar, Phone, Mail, Globe, Loader2, Shield, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const ProfileEdit = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    work: '',
    education: '',
    relationship: '',
    birthday: '',
    phone: '',
    email: '',
    website: '',
    interests: ''
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    email_visibility: 'friends',
    phone_visibility: 'private',
    friends_visibility: 'public',
    posts_visibility: 'friends',
    photos_visibility: 'friends',
    allow_friend_requests: true,
    allow_tagging: true,
    show_online_status: true
  });
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [coverPhotoPreview, setCoverPhotoPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();

  // Carregar dados do usuário atual
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/users/me');
        const userData = response.data;
        
        // Preencher dados do formulário
        setFormData({
          name: userData.name || '',
          bio: userData.bio || '',
          location: userData.location || '',
          work: userData.work || '',
          education: userData.education || '',
          relationship: userData.relationship_status || '',
          birthday: userData.birthday || '',
          phone: userData.phone || '',
          email: userData.email || '',
          website: userData.website || '',
          interests: userData.interests || ''
        });
        
        // Preencher configurações de privacidade
        if (userData.privacy_settings) {
          setPrivacySettings(userData.privacy_settings);
        }
        
        // Preencher previews de imagens
        if (userData.avatar) {
          setProfilePicturePreview(userData.avatar);
        }
        
        if (userData.cover_photo) {
          setCoverPhotoPreview(userData.cover_photo);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados do perfil.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Atualizar informações do perfil
      await axios.put('/api/users/me', formData);
      
      // Atualizar configurações de privacidade
      await axios.put('/api/users/me/privacy', privacySettings);
      
      // Fazer upload da foto de perfil, se houver
      if (profilePicture) {
        const formDataProfile = new FormData();
        formDataProfile.append('file', profilePicture);
        await axios.post('/api/users/me/avatar', formDataProfile, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      // Fazer upload da foto de capa, se houver
      if (coverPhoto) {
        const formDataCover = new FormData();
        formDataCover.append('file', coverPhoto);
        await axios.post('/api/users/me/cover', formDataCover, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });
      
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as alterações do perfil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Editar Perfil</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-6 pt-2">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="p-6 space-y-6">
          {/* Seção de fotos de perfil e capa */}
          <div className="text-center mb-8">
            <div className="relative w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {coverPhotoPreview ? (
                <img src={coverPhotoPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : null}
              <label htmlFor="cover-upload" className="absolute bottom-2 right-2 cursor-pointer">
                <div className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
                  <Camera className="h-4 w-4" />
                </div>
                <input 
                  id="cover-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleCoverPhotoChange} 
                  disabled={isLoading}
                />
              </label>
            </div>
            
            <div className="relative inline-block mb-4">
              <Avatar className="h-24 w-24 border-4 border-white -mt-12">
                <AvatarImage src={profilePicturePreview} alt={formData.name} />
                <AvatarFallback className="text-xl">{formData.name ? formData.name.charAt(0) : '?'}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                <div className="rounded-full bg-[#1877f2] text-white hover:bg-[#166fe5] h-8 w-8 p-0 flex items-center justify-center">
                  <Camera className="h-4 w-4" />
                </div>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleProfilePictureChange} 
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          <TabsContent value="basic" className="space-y-6 mt-0">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Conte um pouco sobre você..."
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="mt-1"
                  placeholder="Cidade, Estado, País"
                  disabled={isLoading}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 mt-0">
            {/* Informações de Contato */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="mt-1"
                    placeholder="https://..."
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-medium text-blue-700">Visibilidade do Email</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quem pode ver seu email</span>
                  <Select 
                    value={privacySettings.email_visibility} 
                    onValueChange={(value) => handlePrivacyChange('email_visibility', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="friends">Amigos</SelectItem>
                      <SelectItem value="private">Somente eu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-medium text-blue-700">Visibilidade do Telefone</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quem pode ver seu telefone</span>
                  <Select 
                    value={privacySettings.phone_visibility} 
                    onValueChange={(value) => handlePrivacyChange('phone_visibility', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="friends">Amigos</SelectItem>
                      <SelectItem value="private">Somente eu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-0">
            {/* Trabalho e Educação */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Trabalho e Educação</h3>
              
              <div>
                <Label htmlFor="work">Trabalho</Label>
                <Input
                  id="work"
                  value={formData.work}
                  onChange={(e) => handleInputChange('work', e.target.value)}
                  className="mt-1"
                  placeholder="Cargo na Empresa"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="education">Educação</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="mt-1"
                  placeholder="Escola ou Universidade"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday">Data de Nascimento</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleInputChange('birthday', e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="relationship">Status de Relacionamento</Label>
                  <Select 
                    value={formData.relationship} 
                    onValueChange={(value) => handleInputChange('relationship', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Solteiro(a)</SelectItem>
                      <SelectItem value="In a relationship">Em um relacionamento</SelectItem>
                      <SelectItem value="Engaged">Noivo(a)</SelectItem>
                      <SelectItem value="Married">Casado(a)</SelectItem>
                      <SelectItem value="It's complicated">É complicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="interests">Interesses</Label>
                <Input
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  className="mt-1"
                  placeholder="O que você gosta?"
                  disabled={isLoading}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-0">
            {/* Configurações de Privacidade */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Configurações de Privacidade</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-medium text-blue-700">Visibilidade do Perfil</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quem pode ver seu perfil</span>
                    <Select 
                      value={privacySettings.profile_visibility} 
                      onValueChange={(value) => handlePrivacyChange('profile_visibility', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="friends">Amigos</SelectItem>
                        <SelectItem value="private">Somente eu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quem pode ver seus amigos</span>
                    <Select 
                      value={privacySettings.friends_visibility} 
                      onValueChange={(value) => handlePrivacyChange('friends_visibility', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="friends">Amigos</SelectItem>
                        <SelectItem value="private">Somente eu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quem pode ver suas postagens</span>
                    <Select 
                      value={privacySettings.posts_visibility} 
                      onValueChange={(value) => handlePrivacyChange('posts_visibility', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="friends">Amigos</SelectItem>
                        <SelectItem value="private">Somente eu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quem pode ver suas fotos</span>
                    <Select 
                      value={privacySettings.photos_visibility} 
                      onValueChange={(value) => handlePrivacyChange('photos_visibility', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="friends">Amigos</SelectItem>
                        <SelectItem value="private">Somente eu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-medium text-blue-700">Interações</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Permitir solicitações de amizade</span>
                      <p className="text-xs text-gray-500">Se desativado, ninguém poderá enviar solicitações de amizade para você</p>
                    </div>
                    <Switch 
                      checked={privacySettings.allow_friend_requests} 
                      onCheckedChange={(checked) => handlePrivacyChange('allow_friend_requests', checked)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Permitir marcações</span>
                      <p className="text-xs text-gray-500">Se desativado, ninguém poderá marcar você em posts ou fotos</p>
                    </div>
                    <Switch 
                      checked={privacySettings.allow_tagging} 
                      onCheckedChange={(checked) => handlePrivacyChange('allow_tagging', checked)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Mostrar status online</span>
                      <p className="text-xs text-gray-500">Se desativado, seu status online não será visível para outros usuários</p>
                    </div>
                    <Switch 
                      checked={privacySettings.show_online_status} 
                      onCheckedChange={(checked) => handlePrivacyChange('show_online_status', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
        </Tabs>

        <div className="border-t p-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;