import React, { useState } from 'react';
import CreatePost from './CreatePost';
import Post from './Post';
import Stories from './Stories';
import { mockPosts } from '../data/mockData';

const NewsFeed = () => {
  const [posts, setPosts] = useState(mockPosts);

  const handleCreatePost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId, comment) => {
    // In a real app, this would add the comment to the post
    console.log(`Comment on post ${postId}: ${comment}`);
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto">
      {/* Stories */}
      <Stories />
      
      {/* Create Post */}
      <CreatePost onCreatePost={handleCreatePost} />
      
      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center py-8">
        <button className="text-[#1877f2] hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors">
          Load more posts
        </button>
      </div>
    </div>
  );
};

export default NewsFeed;