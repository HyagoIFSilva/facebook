import React from 'react';
import { Home, Users, Bookmark, Clock, ChevronDown, Calendar, Flag, Play, ShoppingBag, Users2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { currentUser, mockGroups } from '../data/mockData';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const mainItems = [
    { id: 'profile', icon: null, label: currentUser.name, avatar: currentUser.avatar },
    { id: 'friends', icon: Users, label: 'Friends' },
    { id: 'memories', icon: Clock, label: 'Memories' },
    { id: 'saved', icon: Bookmark, label: 'Saved' },
    { id: 'groups', icon: Users2, label: 'Groups' },
    { id: 'video', icon: Play, label: 'Video' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'pages', icon: Flag, label: 'Pages' },
  ];

  return (
    <div className="hidden lg:block w-80 bg-white h-screen sticky top-14 overflow-y-auto">
      <div className="p-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveTab(item.id)}
              className={`w-full justify-start px-3 py-2 h-auto ${
                activeTab === item.id ? 'bg-blue-50 text-[#1877f2]' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.avatar ? (
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarImage src={item.avatar} alt={item.label} />
                  <AvatarFallback>{item.label.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <item.icon className="h-5 w-5 mr-3" />
              )}
              <span className="font-medium">{item.label}</span>
            </Button>
          ))}
        </div>

        <Button variant="ghost" className="w-full justify-start px-3 py-2 text-gray-700 hover:bg-gray-100">
          <ChevronDown className="h-5 w-5 mr-3" />
          <span className="font-medium">See more</span>
        </Button>

        <Separator className="my-4" />

        {/* Your shortcuts */}
        <div>
          <h3 className="text-gray-600 font-semibold text-sm px-3 mb-3">Your shortcuts</h3>
          <div className="space-y-1">
            {mockGroups.slice(0, 3).map((group) => (
              <Button
                key={group.id}
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto text-gray-700 hover:bg-gray-100"
              >
                <img 
                  src={group.image} 
                  alt={group.name}
                  className="h-9 w-9 mr-3 rounded-lg object-cover"
                />
                <span className="font-medium truncate">{group.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;