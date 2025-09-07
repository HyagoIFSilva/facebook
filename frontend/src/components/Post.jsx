import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

const Post = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const reactions = [
    { emoji: '👍', name: 'like', color: 'text-blue-600' },
    { emoji: '❤️', name: 'love', color: 'text-red-600' },
    { emoji: '😮', name: 'wow', color: 'text-yellow-600' },
    { emoji: '😂', name: 'haha', color: 'text-yellow-600' },
    { emoji: '😢', name: 'sad', color: 'text-yellow-600' },
    { emoji: '😠', name: 'angry', color: 'text-red-600' },
  ];

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full p-2">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-gray-900 leading-relaxed">{post.content}</p>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="w-full">
            <img
              src={post.image}
              alt="Post content"
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        {/* Reaction Summary */}
        {likesCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  👍
                </div>
                {post.reactions?.love > 0 && (
                  <div className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    ❤️
                  </div>
                )}
              </div>
              <span className="text-gray-600 text-sm hover:underline cursor-pointer">
                {formatNumber(likesCount)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-600 text-sm">
              {post.comments > 0 && (
                <span className="hover:underline cursor-pointer">
                  {formatNumber(post.comments)} comments
                </span>
              )}
              {post.shares > 0 && (
                <span className="hover:underline cursor-pointer">
                  {formatNumber(post.shares)} shares
                </span>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 flex-1 justify-center hover:bg-gray-100 ${
              isLiked ? 'text-[#1877f2]' : 'text-gray-600'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 flex-1 justify-center text-gray-600 hover:bg-gray-100"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 flex-1 justify-center text-gray-600 hover:bg-gray-100"
          >
            <Share className="h-4 w-4" />
            <span className="font-medium">Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <>
            <Separator />
            <div className="p-4">
              {/* Add Comment */}
              <div className="flex space-x-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="You" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:bg-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-full disabled:opacity-50"
                  >
                    Post
                  </Button>
                </div>
              </div>

              {/* Existing Comments */}
              <div className="space-y-3">
                {[1, 2].map((comment) => (
                  <div key={comment} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/api/placeholder/32/32" alt="Commenter" />
                      <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <h4 className="font-semibold text-sm text-gray-900">Jane Smith</h4>
                        <p className="text-sm text-gray-800">Great post! Thanks for sharing.</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <button className="hover:text-gray-700">Like</button>
                        <button className="hover:text-gray-700">Reply</button>
                        <span>2h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Post;