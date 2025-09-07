import React, { useState } from 'react';
import { Image, Video, Smile, MapPin, Tag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { currentUser } from '../data/mockData';

const CreatePost = ({ onCreatePost }) => {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (postContent.trim() || selectedImage) {
      const newPost = {
        id: Date.now(),
        author: currentUser,
        content: postContent,
        image: selectedImage,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        reactions: { like: 0, love: 0, wow: 0, haha: 0, sad: 0, angry: 0 }
      };
      
      onCreatePost(newPost);
      setPostContent('');
      setSelectedImage(null);
    }
  };

  const postOptions = [
    { icon: Image, label: 'Photo/Video', color: 'text-green-600' },
    { icon: Tag, label: 'Tag friends', color: 'text-blue-600' },
    { icon: Smile, label: 'Feeling/Activity', color: 'text-yellow-600' },
    { icon: MapPin, label: 'Check in', color: 'text-red-600' },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Create Post Input */}
        <div className="flex space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="resize-none border-none shadow-none bg-gray-100 rounded-3xl px-4 py-3 text-lg placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-[#1877f2]"
              rows={selectedImage ? 3 : 2}
            />
          </div>
        </div>

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="mb-4 relative">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="w-full max-h-96 object-cover rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
            >
              ×
            </Button>
          </div>
        )}

        <Separator className="mb-4" />

        {/* Post Options */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {postOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2"
                onClick={option.label === 'Photo/Video' ? () => document.getElementById('image-upload').click() : undefined}
              >
                <option.icon className={`h-5 w-5 ${option.color}`} />
                <span className="text-gray-700 font-medium hidden sm:block">{option.label}</span>
              </Button>
            ))}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!postContent.trim() && !selectedImage}
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-8 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;