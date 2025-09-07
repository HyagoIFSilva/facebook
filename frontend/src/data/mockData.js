// Mock data for Facebook clone
export const currentUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@email.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  coverPhoto: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=300&fit=crop",
  friends: 342,
  location: "New York, NY",
  bio: "Software Engineer | Travel Enthusiast | Coffee Lover",
  joined: "2020-01-15"
};

export const mockUsers = [
  {
    id: 2,
    name: "Sarah Wilson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b401?w=150&h=150&fit=crop&crop=face",
    location: "California, USA"
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "Texas, USA"
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    location: "Florida, USA"
  },
  {
    id: 5,
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: "Seattle, USA"
  }
];

export const mockPosts = [
  {
    id: 1,
    author: mockUsers[0],
    content: "Just finished an amazing hike in Yosemite! The views were absolutely breathtaking. Nature never fails to inspire me. 🏔️",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8,
    shares: 3,
    reactions: {
      like: 15,
      love: 6,
      wow: 3
    }
  },
  {
    id: 2,
    author: mockUsers[1],
    content: "Working on a new project today. Excited to share the results soon! The team has been incredible and we're making great progress. #coding #teamwork",
    timestamp: "4 hours ago",
    likes: 18,
    comments: 5,
    shares: 2,
    reactions: {
      like: 12,
      love: 4,
      wow: 2
    }
  },
  {
    id: 3,
    author: mockUsers[2],
    content: "Sunday brunch with the family! Nothing beats homemade pancakes and good company. Hope everyone is having a wonderful weekend!",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=400&fit=crop",
    timestamp: "6 hours ago",
    likes: 31,
    comments: 12,
    shares: 5,
    reactions: {
      like: 20,
      love: 8,
      haha: 3
    }
  },
  {
    id: 4,
    author: mockUsers[3],
    content: "Attended an amazing tech conference today! So many innovative ideas and inspiring speakers. The future of technology looks bright! 💡",
    timestamp: "8 hours ago",
    likes: 27,
    comments: 9,
    shares: 7,
    reactions: {
      like: 18,
      love: 5,
      wow: 4
    }
  },
  {
    id: 5,
    author: mockUsers[0],
    content: "Coffee shop vibes ☕ Perfect spot for some weekend reading. Currently diving into a fascinating book about artificial intelligence and its impact on society.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=400&fit=crop",
    timestamp: "1 day ago",
    likes: 19,
    comments: 6,
    shares: 2,
    reactions: {
      like: 14,
      love: 5
    }
  }
];

export const mockComments = {
  1: [
    {
      id: 1,
      author: mockUsers[1],
      content: "Wow, those views are incredible! I need to visit Yosemite soon.",
      timestamp: "1 hour ago",
      likes: 3
    },
    {
      id: 2,
      author: mockUsers[2],
      content: "Amazing photos! Thanks for sharing this beautiful moment.",
      timestamp: "45 minutes ago",
      likes: 2
    }
  ],
  2: [
    {
      id: 3,
      author: mockUsers[0],
      content: "Can't wait to see what you're working on! Your projects are always innovative.",
      timestamp: "2 hours ago",
      likes: 1
    }
  ],
  3: [
    {
      id: 4,
      author: mockUsers[3],
      content: "Those pancakes look delicious! Mind sharing the recipe?",
      timestamp: "3 hours ago",
      likes: 4
    },
    {
      id: 5,
      author: mockUsers[0],
      content: "Family time is the best time! Enjoy your Sunday.",
      timestamp: "2 hours ago",
      likes: 2
    }
  ]
};

export const mockStories = [
  {
    id: 1,
    author: currentUser,
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=500&fit=crop",
    timestamp: "3 hours ago"
  },
  {
    id: 2,
    author: mockUsers[0],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop",
    timestamp: "5 hours ago"
  },
  {
    id: 3,
    author: mockUsers[1],
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=500&fit=crop",
    timestamp: "7 hours ago"
  },
  {
    id: 4,
    author: mockUsers[2],
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=500&fit=crop",
    timestamp: "12 hours ago"
  }
];

export const mockFriendSuggestions = [
  {
    id: 6,
    name: "Jessica Martinez",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    mutualFriends: 12,
    location: "Miami, FL"
  },
  {
    id: 7,
    name: "David Park",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    mutualFriends: 8,
    location: "Los Angeles, CA"
  },
  {
    id: 8,
    name: "Lisa Thompson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    mutualFriends: 15,
    location: "Chicago, IL"
  }
];

export const mockGroups = [
  {
    id: 1,
    name: "Photography Enthusiasts",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=300&h=200&fit=crop",
    members: 15420,
    description: "A community for photographers to share tips, techniques, and stunning captures."
  },
  {
    id: 2,
    name: "Tech Innovators Hub",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
    members: 8967,
    description: "Discussing latest trends in technology, startups, and innovation."
  },
  {
    id: 3,
    name: "Cooking Masters",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
    members: 23451,
    description: "Share recipes, cooking tips, and food adventures with fellow food lovers."
  }
];

export const mockMessages = [
  {
    id: 1,
    user: mockUsers[0],
    lastMessage: "Hey! How was your weekend?",
    timestamp: "2 minutes ago",
    unread: true
  },
  {
    id: 2,
    user: mockUsers[1],
    lastMessage: "Thanks for sharing that article!",
    timestamp: "1 hour ago",
    unread: false
  },
  {
    id: 3,
    user: mockUsers[2],
    lastMessage: "Are we still on for lunch tomorrow?",
    timestamp: "3 hours ago",
    unread: true
  }
];

export const mockNotifications = [
  {
    id: 1,
    type: "like",
    user: mockUsers[0],
    content: "liked your post",
    timestamp: "5 minutes ago",
    read: false
  },
  {
    id: 2,
    type: "comment",
    user: mockUsers[1],
    content: "commented on your photo",
    timestamp: "1 hour ago",
    read: false
  },
  {
    id: 3,
    type: "friend_request",
    user: mockUsers[2],
    content: "sent you a friend request",
    timestamp: "2 hours ago",
    read: true
  }
];