import React from 'react';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { currentUser, mockStories } from '../data/mockData';

const Stories = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {/* Create Story */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-32 bg-gradient-to-b from-gray-200 to-gray-300 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <img
                src={currentUser.avatar}
                alt="Your story"
                className="w-full h-20 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-white">
                <div className="bg-[#1877f2] text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto -mt-3 border-2 border-white">
                  <Plus className="h-3 w-3" />
                </div>
                <p className="text-xs font-medium text-center mt-1 text-gray-900">Create Story</p>
              </div>
            </div>
          </div>

          {/* Existing Stories */}
          {mockStories.map((story) => (
            <div key={story.id} className="flex-shrink-0">
              <div className="relative w-24 h-32 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                <img
                  src={story.image}
                  alt={`${story.author.name}'s story`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                
                {/* Author Avatar */}
                <div className="absolute top-2 left-2">
                  <Avatar className="h-8 w-8 border-2 border-[#1877f2]">
                    <AvatarImage src={story.author.avatar} alt={story.author.name} />
                    <AvatarFallback>{story.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Author Name */}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate">
                    {story.author.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Stories;