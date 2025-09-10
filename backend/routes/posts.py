from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
import boto3
import os
import uuid
from datetime import datetime
import json

from models import Post, PostCreate, PostUpdate, Comment, CommentCreate, UserProfile, NotificationType, PrivacyLevel
from auth import get_current_active_user

router = APIRouter(prefix="/posts", tags=["posts"])

# Configuração do S3 para upload de imagens
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION')
)
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

# Função para upload de imagem para o S3
async def upload_image_to_s3(file: UploadFile, folder: str) -> str:
    file_extension = file.filename.split('.')[-1]
    file_name = f"{folder}/{uuid.uuid4()}.{file_extension}"
    
    s3_client.upload_fileobj(
        file.file,
        BUCKET_NAME,
        file_name,
        ExtraArgs={
            "ContentType": file.content_type,
            "ACL": "public-read"
        }
    )
    
    return f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_name}"

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_post(content: str = Form(...), 
                     privacy: PrivacyLevel = Form(PrivacyLevel.FRIENDS),
                     files: List[UploadFile] = File(None),
                     db: AsyncIOMotorClient = Depends(), 
                     current_user: UserProfile = Depends(get_current_active_user)):
    # Upload de arquivos, se houver
    media_urls = []
    if files:
        for file in files:
            if file.content_type.startswith('image/'):
                media_url = await upload_image_to_s3(file, f"posts/{current_user.id}")
                media_urls.append(media_url)
    
    # Criar post
    post = Post(
        author_id=current_user.id,
        content=content,
        media_urls=media_urls,
        privacy=privacy
    )
    
    await db.posts.insert_one(post.dict())
    
    # Adicionar informações do autor para retorno
    post_dict = post.dict()
    post_dict["author"] = {
        "id": current_user.id,
        "name": current_user.name,
        "avatar": current_user.avatar,
        "is_verified": current_user.is_verified
    }
    
    return post_dict

@router.get("/", response_model=List[dict])
async def get_feed(skip: int = 0, limit: int = 10, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar amigos do usuário
    friendships = await db.friend_requests.find({
        "$or": [
            {"requester_id": current_user.id, "status": "accepted"},
            {"recipient_id": current_user.id, "status": "accepted"}
        ]
    }).to_list(1000)
    
    friend_ids = []
    for friendship in friendships:
        friend_id = friendship["recipient_id"] if friendship["requester_id"] == current_user.id else friendship["requester_id"]
        friend_ids.append(friend_id)
    
    # Buscar posts do usuário e de seus amigos
    posts = await db.posts.find({
        "$or": [
            # Posts do próprio usuário
            {"author_id": current_user.id},
            # Posts públicos
            {"privacy": "public"},
            # Posts de amigos com privacidade para amigos
            {"author_id": {"$in": friend_ids}, "privacy": "friends"}
        ]
    }).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Adicionar informações do autor e contagem de comentários
    result = []
    for post in posts:
        author = await db.users.find_one({"id": post["author_id"]})
        if author:
            post_dict = {
                "id": post["id"],
                "content": post["content"],
                "media_urls": post.get("media_urls", []),
                "created_at": post["created_at"],
                "updated_at": post["updated_at"],
                "likes": post.get("likes", []),
                "like_count": len(post.get("likes", [])),
                "comment_count": len(post.get("comments", [])),
                "share_count": post.get("shares", 0),
                "author": {
                    "id": author["id"],
                    "name": author["name"],
                    "avatar": author.get("avatar"),
                    "is_verified": author.get("is_verified", False)
                },
                "is_liked": current_user.id in post.get("likes", [])
            }
            result.append(post_dict)
    
    return result

@router.get("/user/{user_id}", response_model=List[dict])
async def get_user_posts(user_id: str, skip: int = 0, limit: int = 10, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Verificar se o usuário existe
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar relação de amizade para determinar quais posts podem ser vistos
    is_friend = False
    if user_id != current_user.id:
        friendship = await db.friend_requests.find_one({
            "$or": [
                {"requester_id": current_user.id, "recipient_id": user_id, "status": "accepted"},
                {"requester_id": user_id, "recipient_id": current_user.id, "status": "accepted"}
            ]
        })
        is_friend = friendship is not None
    
    # Construir query baseada na relação
    query = {"author_id": user_id}
    if user_id != current_user.id:
        if is_friend:
            query["privacy"] = {"$in": ["public", "friends"]}
        else:
            query["privacy"] = "public"
    
    # Buscar posts
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Adicionar informações do autor e contagem de comentários
    result = []
    for post in posts:
        post_dict = {
            "id": post["id"],
            "content": post["content"],
            "media_urls": post.get("media_urls", []),
            "created_at": post["created_at"],
            "updated_at": post["updated_at"],
            "likes": post.get("likes", []),
            "like_count": len(post.get("likes", [])),
            "comment_count": len(post.get("comments", [])),
            "share_count": post.get("shares", 0),
            "author": {
                "id": user["id"],
                "name": user["name"],
                "avatar": user.get("avatar"),
                "is_verified": user.get("is_verified", False)
            },
            "is_liked": current_user.id in post.get("likes", [])
        }
        result.append(post_dict)
    
    return result

@router.get("/{post_id}", response_model=dict)
async def get_post(post_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar post
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verificar permissão para ver o post
    if post["author_id"] != current_user.id:
        if post["privacy"] == "private":
            raise HTTPException(status_code=403, detail="Not authorized to view this post")
        elif post["privacy"] == "friends":
            # Verificar se são amigos
            friendship = await db.friend_requests.find_one({
                "$or": [
                    {"requester_id": current_user.id, "recipient_id": post["author_id"], "status": "accepted"},
                    {"requester_id": post["author_id"], "recipient_id": current_user.id, "status": "accepted"}
                ]
            })
            if not friendship:
                raise HTTPException(status_code=403, detail="Not authorized to view this post")
    
    # Buscar informações do autor
    author = await db.users.find_one({"id": post["author_id"]})
    
    # Montar resposta
    post_dict = {
        "id": post["id"],
        "content": post["content"],
        "media_urls": post.get("media_urls", []),
        "created_at": post["created_at"],
        "updated_at": post["updated_at"],
        "likes": post.get("likes", []),
        "like_count": len(post.get("likes", [])),
        "comments": [],
        "share_count": post.get("shares", 0),
        "author": {
            "id": author["id"],
            "name": author["name"],
            "avatar": author.get("avatar"),
            "is_verified": author.get("is_verified", False)
        },
        "is_liked": current_user.id in post.get("likes", [])
    }
    
    # Adicionar comentários com informações do autor
    for comment in post.get("comments", []):
        comment_author = await db.users.find_one({"id": comment["author_id"]})
        if comment_author:
            comment_dict = {
                "id": comment["id"],
                "content": comment["content"],
                "created_at": comment["created_at"],
                "likes": comment.get("likes", []),
                "like_count": len(comment.get("likes", [])),
                "author": {
                    "id": comment_author["id"],
                    "name": comment_author["name"],
                    "avatar": comment_author.get("avatar"),
                    "is_verified": comment_author.get("is_verified", False)
                },
                "is_liked": current_user.id in comment.get("likes", [])
            }
            post_dict["comments"].append(comment_dict)
    
    # Ordenar comentários por data
    post_dict["comments"].sort(key=lambda x: x["created_at"])
    
    return post_dict

@router.put("/{post_id}")
async def update_post(post_id: str, post_update: PostUpdate, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar post
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verificar se o usuário é o autor
    if post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    # Filtrar campos não nulos para atualização
    update_data = {k: v for k, v in post_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    if update_data:
        await db.posts.update_one(
            {"id": post_id},
            {"$set": update_data}
        )
    
    # Retornar post atualizado
    updated_post = await db.posts.find_one({"id": post_id})
    
    return {
        "id": updated_post["id"],
        "content": updated_post["content"],
        "media_urls": updated_post.get("media_urls", []),
        "privacy": updated_post["privacy"],
        "updated_at": updated_post["updated_at"]
    }

@router.delete("/{post_id}")
async def delete_post(post_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar post
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verificar se o usuário é o autor
    if post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    # Excluir post
    await db.posts.delete_one({"id": post_id})
    
    return {"message": "Post deleted successfully"}

@router.post("/{post_id}/like")
async def like_post(post_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar post
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verificar permissão para ver o post
    if post["author_id"] != current_user.id:
        if post["privacy"] == "private":
            raise HTTPException(status_code=403, detail="Not authorized to view this post")
        elif post["privacy"] == "friends":
            # Verificar se são amigos
            friendship = await db.friend_requests.find_one({
                "$or": [
                    {"requester_id": current_user.id, "recipient_id": post["author_id"], "status": "accepted"},
                    {"requester_id": post["author_id"], "recipient_id": current_user.id, "status": "accepted"}
                ]
            })
            if not friendship:
                raise HTTPException(status_code=403, detail="Not authorized to view this post")
    
    # Verificar se já curtiu
    likes = post.get("likes", [])
    if current_user.id in likes:
        # Remover curtida
        await db.posts.update_one(
            {"id": post_id},
            {"$pull": {"likes": current_user.id}}
        )
        return {"liked": False, "like_count": len(likes) - 1}
    else:
        # Adicionar curtida
        await db.posts.update_one(
            {"id": post_id},
            {"$push": {"likes": current_user.id}}
        )
        
        # Criar notificação se não for o próprio autor
        if post["author_id"] != current_user.id:
            notification = {
                "id": str(uuid.uuid4()),
                "recipient_id": post["author_id"],
                "sender_id": current_user.id,
                "type": NotificationType.POST_LIKE,
                "reference_id": post_id,
                "message": f"{current_user.name} liked your post",
                "is_read": False,
                "created_at": datetime.utcnow()
            }
            
            await db.notifications.insert_one(notification)
        
        return {"liked": True, "like_count": len(likes) + 1}

@router.post("/{post_id}/comments")
async def add_comment(post_id: str, comment_data: CommentCreate, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar post
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verificar permissão para ver o post
    if post["author_id"] != current_user.id:
        if post["privacy"] == "private":
            raise HTTPException(status_code=403, detail="Not authorized to view this post")
        elif post["privacy"] == "friends":
            # Verificar se são amigos
            friendship = await db.friend_requests.find_one({
                "$or": [
                    {"requester_id": current_user.id, "recipient_id": post["author_id"], "status": "accepted"},
                    {"requester_id": post["author_id"], "recipient_id": current_user.id, "status": "accepted"}
                ]
            })
            if not friendship:
                raise HTTPException(status_code=403, detail="Not authorized to view this post")
    
    # Criar comentário
    comment = {
        "id": str(uuid.uuid4()),
        "author_id": current_user.id,
        "content": comment_data.content,
        "created_at": datetime.utcnow(),
        "likes": []
    }
    
    # Adicionar comentário ao post
    await db.posts.update_one(
        {"id": post_id},
        {"$push": {"comments": comment}}
    )
    
    # Criar notificação se não for o próprio autor
    if post["author_id"] != current_user.id:
        notification = {
            "id": str(uuid.uuid4()),
            "recipient_id": post["author_id"],
            "sender_id": current_user.id,
            "type": NotificationType.POST_COMMENT,
            "reference_id": post_id,
            "message": f"{current_user.name} commented on your post",
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        
        await db.notifications.insert_one(notification)
    
    # Retornar comentário com informações do autor
    return {
        "id": comment["id"],
        "content": comment["content"],
        "created_at": comment["created_at"],
        "likes": [],
        "like_count": 0,
        "author": {
            "id": current_user.id,
            "name": current_user.name,
            "avatar": current_user.avatar,
            "is_verified": current_user.is_verified
        },
        "is_liked": False
    }

@router.delete("/{post_id}/comments/{comment_id}")
async def delete_comment(post_id: str, comment_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar post
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Buscar comentário
    comment = None
    for c in post.get("comments", []):
        if c["id"] == comment_id:
            comment = c
            break
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Verificar se o usuário é o autor do comentário ou do post
    if comment["author_id"] != current_user.id and post["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # Remover comentário
    await db.posts.update_one(
        {"id": post_id},
        {"$pull": {"comments": {"id": comment_id}}}
    )
    
    return {"message": "Comment deleted successfully"}

@router.post("/{post_id}/comments/{comment_id}/like")
async def like_comment(post_id: str, comment_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar post
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Buscar comentário
    comment = None
    comment_index = -1
    for i, c in enumerate(post.get("comments", [])):
        if c["id"] == comment_id:
            comment = c
            comment_index = i
            break
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Verificar se já curtiu
    likes = comment.get("likes", [])
    if current_user.id in likes:
        # Remover curtida
        likes.remove(current_user.id)
        liked = False
    else:
        # Adicionar curtida
        likes.append(current_user.id)
        liked = True
        
        # Criar notificação se não for o próprio autor
        if comment["author_id"] != current_user.id:
            notification = {
                "id": str(uuid.uuid4()),
                "recipient_id": comment["author_id"],
                "sender_id": current_user.id,
                "type": NotificationType.COMMENT_LIKE,
                "reference_id": comment_id,
                "message": f"{current_user.name} liked your comment",
                "is_read": False,
                "created_at": datetime.utcnow()
            }
            
            await db.notifications.insert_one(notification)
    
    # Atualizar comentário
    comment["likes"] = likes
    post["comments"][comment_index] = comment
    
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {"comments": post["comments"]}}
    )
    
    return {"liked": liked, "like_count": len(likes)}

@router.post("/{post_id}/share")
async def share_post(post_id: str, content: str = Form(""), db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar post original
    original_post = await db.posts.find_one({"id": post_id})
    if not original_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verificar permissão para ver o post
    if original_post["author_id"] != current_user.id:
        if original_post["privacy"] == "private":
            raise HTTPException(status_code=403, detail="Not authorized to share this post")
        elif original_post["privacy"] == "friends":
            # Verificar se são amigos
            friendship = await db.friend_requests.find_one({
                "$or": [
                    {"requester_id": current_user.id, "recipient_id": original_post["author_id"], "status": "accepted"},
                    {"requester_id": original_post["author_id"], "recipient_id": current_user.id, "status": "accepted"}
                ]
            })
            if not friendship:
                raise HTTPException(status_code=403, detail="Not authorized to share this post")
    
    # Criar novo post como compartilhamento
    shared_post = Post(
        author_id=current_user.id,
        content=content,
        shared_post_id=post_id,
        privacy=PrivacyLevel.FRIENDS
    )
    
    await db.posts.insert_one(shared_post.dict())
    
    # Incrementar contador de compartilhamentos no post original
    await db.posts.update_one(
        {"id": post_id},
        {"$inc": {"shares": 1}}
    )
    
    # Criar notificação se não for o próprio autor
    if original_post["author_id"] != current_user.id:
        notification = {
            "id": str(uuid.uuid4()),
            "recipient_id": original_post["author_id"],
            "sender_id": current_user.id,
            "type": NotificationType.POST_SHARE,
            "reference_id": post_id,
            "message": f"{current_user.name} shared your post",
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        
        await db.notifications.insert_one(notification)
    
    return {"message": "Post shared successfully", "post_id": shared_post.id}