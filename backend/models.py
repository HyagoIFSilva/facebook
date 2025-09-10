from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from enum import Enum

# Enums
class FriendshipStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    BLOCKED = "blocked"

class PrivacyLevel(str, Enum):
    PUBLIC = "public"
    FRIENDS = "friends"
    PRIVATE = "private"

# Base Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    
class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    avatar: Optional[str] = None
    cover_photo: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    work: Optional[str] = None
    education: Optional[str] = None
    relationship_status: Optional[str] = None
    birthday: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    interests: Optional[List[str]] = None
    joined_date: datetime = Field(default_factory=datetime.utcnow)
    is_verified: bool = False
    privacy_settings: Dict[str, PrivacyLevel] = Field(
        default_factory=lambda: {
            "profile": PrivacyLevel.PUBLIC,
            "posts": PrivacyLevel.FRIENDS,
            "friends": PrivacyLevel.FRIENDS,
            "photos": PrivacyLevel.FRIENDS
        }
    )
    achievements: List[Dict[str, Any]] = []
    life_events: List[Dict[str, Any]] = []

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    cover_photo: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    work: Optional[str] = None
    education: Optional[str] = None
    relationship_status: Optional[str] = None
    birthday: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    interests: Optional[List[str]] = None
    privacy_settings: Optional[Dict[str, PrivacyLevel]] = None

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordUpdate(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

# Friendship Models
class FriendRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requester_id: str
    recipient_id: str
    status: FriendshipStatus = FriendshipStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FriendRequestCreate(BaseModel):
    recipient_id: str

class FriendRequestUpdate(BaseModel):
    status: FriendshipStatus

# Post Models
class PostCreate(BaseModel):
    content: str
    media_urls: Optional[List[str]] = None
    privacy: PrivacyLevel = PrivacyLevel.FRIENDS

class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    content: str
    media_urls: Optional[List[str]] = None
    privacy: PrivacyLevel = PrivacyLevel.FRIENDS
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    likes: List[str] = []  # List of user IDs who liked the post
    comments: List[Dict[str, Any]] = []  # List of comment objects
    shares: int = 0

class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    privacy: Optional[PrivacyLevel] = None

# Comment Models
class CommentCreate(BaseModel):
    content: str
    post_id: str

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    author_id: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    likes: List[str] = []  # List of user IDs who liked the comment

# Notification Models
class NotificationType(str, Enum):
    FRIEND_REQUEST = "friend_request"
    FRIEND_ACCEPT = "friend_accept"
    POST_LIKE = "post_like"
    POST_COMMENT = "post_comment"
    POST_SHARE = "post_share"
    COMMENT_LIKE = "comment_like"
    COMMENT_REPLY = "comment_reply"

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_id: str
    sender_id: str
    type: NotificationType
    reference_id: Optional[str] = None  # ID of the related object (post, comment, etc.)
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    name: str
    avatar: Optional[str] = None

class TokenData(BaseModel):
    user_id: str