import React, { useState } from 'react';
import { Camera, Edit, MessageCircle, UserPlus, MoreHorizontal, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { currentUser, mockPosts } from '../data/mockData';
import Post from './Post';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const userPosts = mockPosts.filter(post => post.author.id === currentUser.id);

  const profileTabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'about', label: 'About' },
    { id: 'friends', label: 'Friends' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Photo & Profile Info */}
      <Card className="mb-6 overflow-hidden">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-80 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden">
            <img
              src={currentUser.coverPhoto}
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
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 relative z-10">
              {/* Profile Picture */}
              <div className="relative mb-4 sm:mb-0">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="text-2xl">{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Name & Stats */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentUser.name}</h1>
                <p className="text-gray-600 mb-3">{currentUser.friends} friends</p>
                
                {/* Mutual Friends Preview */}
                <div className="flex -space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=32&h=32&fit=crop&crop=face`} />
                      <AvatarFallback>F{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button className="bg-[#1877f2] hover:bg-[#166fe5] text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to story
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit profile
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
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:text-[#1877f2] data-[state=active]:border-b-2 data-[state=active]:border-[#1877f2] rounded-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - About */}
        <div className="space-y-6">
          {/* Intro */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Intro</h3>
              <div className="space-y-3">
                <p className="text-gray-700 text-center">{currentUser.bio}</p>
                
                <div className="space-y-2">
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
                    <span>Lives in {currentUser.location}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Edit details
                </Button>
              </div>
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
              <p className="text-gray-600 text-sm mb-4">{currentUser.friends} friends</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarImage src={`https://images.unsplash.com/photo-${1400000000000 + i * 10000}?w=64&h=64&fit=crop&crop=face`} />
                      <AvatarFallback>F{i}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium text-gray-900 truncate">Friend {i}</p>
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
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="flex-1 justify-start text-gray-500 bg-gray-100 hover:bg-gray-200">
                      What's on your mind, {currentUser.name.split(' ')[0]}?
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
                <h3 className="font-semibold text-lg mb-4">About {currentUser.name}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Work</h4>
                    <p className="text-gray-600">Software Engineer at Tech Corp</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                    <p className="text-gray-600">Massachusetts Institute of Technology</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Lives in</h4>
                    <p className="text-gray-600">{currentUser.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Joined</h4>
                    <p className="text-gray-600">January 2020</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;