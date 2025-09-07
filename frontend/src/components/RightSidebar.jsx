import React from 'react';
import { UserPlus, X, MessageCircle, Calendar, Gift } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { mockFriendSuggestions, mockMessages } from '../data/mockData';

const RightSidebar = () => {
  const birthdays = [
    {
      id: 1,
      name: "Alice Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b401?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const onlineContacts = [
    {
      id: 1,
      name: "Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b401?w=150&h=150&fit=crop&crop=face",
      isOnline: true
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isOnline: true
    },
    {
      id: 3,
      name: "Emily Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isOnline: false
    },
    {
      id: 4,
      name: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      isOnline: true
    }
  ];

  return (
    <div className="hidden xl:block w-80 bg-white h-screen sticky top-14 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Sponsored */}
        <div>
          <h3 className="text-gray-600 font-semibold text-sm mb-3 px-2">Sponsored</h3>
          <Card className="border-none shadow-none">
            <CardContent className="p-3">
              <div className="flex space-x-3">
                <img 
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
                  alt="Ad"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900">Premium Online Courses</h4>
                  <p className="text-xs text-gray-600 mt-1">Learn new skills with expert instructors</p>
                  <p className="text-xs text-gray-500 mt-1">coursera.org</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full p-1 h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Birthdays */}
        {birthdays.length > 0 && (
          <>
            <div>
              <div className="flex items-center space-x-2 mb-3 px-2">
                <Gift className="h-4 w-4 text-[#1877f2]" />
                <h3 className="text-gray-600 font-semibold text-sm">Birthdays</h3>
              </div>
              {birthdays.map((person) => (
                <div key={person.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{person.name}</span> has a birthday today.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
          </>
        )}

        {/* Friend Suggestions */}
        <div>
          <h3 className="text-gray-600 font-semibold text-sm mb-3 px-2">People you may know</h3>
          <div className="space-y-3">
            {mockFriendSuggestions.slice(0, 3).map((person) => (
              <div key={person.id} className="p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{person.name}</h4>
                    <p className="text-xs text-gray-600">{person.mutualFriends} mutual friends</p>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full p-1 h-6 w-6">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1 bg-[#1877f2] hover:bg-[#166fe5] text-white">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Friend
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Contacts */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-gray-600 font-semibold text-sm">Contacts</h3>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="rounded-full p-1 h-6 w-6">
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            {onlineContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium text-sm text-gray-900">{contact.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;