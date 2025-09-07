import React, { useState } from 'react';
import { Search, Home, Users, MessageCircle, Bell, Menu, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { currentUser, mockNotifications } from '../data/mockData';

const Header = ({ activeTab, setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'friends', icon: Users, label: 'Friends' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left Section - Logo and Search */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              <div className="bg-[#1877f2] text-white font-bold text-xl px-3 py-1 rounded-lg">
                f
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Facebook</span>
            </div>
            
            <div className="relative max-w-md flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search Facebook"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-100 border-none rounded-full focus:bg-white focus:ring-2 focus:ring-[#1877f2]"
              />
            </div>
          </div>

          {/* Center Section - Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`px-8 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'text-[#1877f2] bg-blue-50 border-b-2 border-[#1877f2]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-6 w-6" />
              </Button>
            ))}
          </div>

          {/* Right Section - Actions and Profile */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <Plus className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="sm" className="rounded-full p-2 relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="sm" className="rounded-full p-2 md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;