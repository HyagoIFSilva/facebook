import React, { useState } from 'react';
import { Camera, Edit, MessageCircle, UserPlus, MoreHorizontal, MapPin, Briefcase, GraduationCap, Heart, Calendar, Phone, Mail, Globe, Users, Image, Video, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { currentUser, mockPosts, mockUsers } from '../data/mockData';
import Post from './Post';
import ProfileEdit from './ProfileEdit';

const ProfileEnhanced = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [userInfo, setUserInfo] = useState(currentUser);
  const userPosts = mockPosts.filter(post => post.author.id === currentUser.id);

  const profileTabs = [
    { id: 'posts', label: 'Posts', count: userPosts.length },
    { id: 'about', label: 'About' },
    { id: 'friends', label: 'Friends', count: currentUser.friends },
    { id: 'photos', label: 'Photos', count: 127 },
    { id: 'videos', label: 'Videos', count: 23 },
    { id: 'reviews', label: 'Reviews', count: 8 },
  ];

  const handleEditProfile = (updatedData) => {
    setUserInfo({ ...userInfo, ...updatedData });
  };

  const achievements = [
    { icon: Star, label: 'Top Contributor', description: 'Active community member' },
    { icon: Users, label: 'Social Butterfly', description: '500+ connections' },
    { icon: Image, label: 'Photo Enthusiast', description: '100+ photos shared' },
  ];

  const lifeEvents = [
    { icon: Briefcase, event: 'Started working at Tech Corp', date: 'January 2023', location: 'New York, NY' },
    { icon: GraduationCap, event: 'Graduated from MIT', date: 'May 2020', location: 'Cambridge, MA' },
    { icon: MapPin, event: 'Moved to New York', date: 'August 2022', location: 'New York, NY' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cover Photo & Profile Info */}
      <Card className="mb-6 overflow-hidden">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-80 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden">
            <img
              src={userInfo.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <Button className="absolute bottom-4 right-4 bg-white text-gray-900 hover:bg-gray-100">
              <Camera className="h-4 w-4 mr-2" />
              Edit cover photo
            </Button>
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
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
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
              <div className="space-y-3">
                <p className="text-gray-700 text-center">{userInfo.bio}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span>Software Engineer at Tech Corp</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>Studied Computer Science at MIT</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Lives in {userInfo.location}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Heart className="h-4 w-4" />
                    <span>Single</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Born January 15, 1990</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Edit details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Achievements</h3>
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
            </CardContent>
          </Card>

          {/* Life Events */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Life Events</h3>
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
              <Button variant="outline" className="w-full mt-4">
                <Calendar className="h-4 w-4 mr-2" />
                Add life event
              </Button>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Photos</h3>
                <Button variant="ghost" size="sm" className="text-[#1877f2]">
                  See all photos
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=150&h=150&fit=crop`}
                      alt={`Photo ${i}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Friends */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Friends</h3>
                <Button variant="ghost" size="sm" className="text-[#1877f2]">
                  See all friends
                </Button>
              </div>
              <p className="text-gray-600 text-sm mb-4">{userInfo.friends} friends</p>
              <div className="grid grid-cols-3 gap-3">
                {mockUsers.slice(0, 9).map((friend, index) => (
                  <div key={friend.id} className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium text-gray-900 truncate">{friend.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Posts */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'posts' && (
            <>
              {/* Create Post */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                      <AvatarFallback>{userInfo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="flex-1 justify-start text-gray-500 bg-gray-100 hover:bg-gray-200">
                      What's on your mind, {userInfo.name.split(' ')[0]}?
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* User Posts */}
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <Post key={post.id} post={post} />
                ))}
              </div>
            </>
          )}

          {activeTab === 'about' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">About {userInfo.name}</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{userInfo.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">https://johndoe.dev</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Work and Education</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Software Engineer at Tech Corp</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Massachusetts Institute of Technology</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Lives in {userInfo.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Heart className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Single</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Born January 15, 1990</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'friends' && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Friends ({userInfo.friends})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mockUsers.map((friend) => (
                    <div key={friend.id} className="text-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <Avatar className="h-20 w-20 mx-auto mb-3">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h4 className="font-medium text-gray-900 mb-1">{friend.name}</h4>
                      <p className="text-sm text-gray-500">{friend.location}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
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