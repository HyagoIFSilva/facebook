from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
import boto3
import os
import uuid
from datetime import datetime

from models import UserProfile, UserProfileUpdate, PrivacyLevel
from auth import get_current_active_user

router = APIRouter(prefix="/users", tags=["users"])

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

@router.get("/", response_model=List[UserProfile])
async def get_users(skip: int = 0, limit: int = 10, db: AsyncIOMotorClient = Depends()):
    users = await db.users.find().skip(skip).limit(limit).to_list(limit)
    return [UserProfile(**user) for user in users]

@router.get("/{user_id}", response_model=UserProfile)
async def get_user(user_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar configurações de privacidade
    if user_id != current_user.id:
        # Se o perfil for privado, verificar se são amigos
        if user["privacy_settings"]["profile"] == PrivacyLevel.PRIVATE:
            # Verificar se são amigos
            friendship = await db.friendships.find_one({
                "$or": [
                    {"requester_id": current_user.id, "recipient_id": user_id, "status": "accepted"},
                    {"requester_id": user_id, "recipient_id": current_user.id, "status": "accepted"}
                ]
            })
            
            if not friendship:
                # Retornar versão limitada do perfil
                return UserProfile(
                    id=user["id"],
                    name=user["name"],
                    avatar=user["avatar"],
                    is_verified=user.get("is_verified", False)
                )
    
    return UserProfile(**user)

@router.put("/me", response_model=UserProfile)
async def update_user_profile(profile_update: UserProfileUpdate, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Filtrar campos não nulos para atualização
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    
    if update_data:
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": update_data}
        )
    
    # Retornar perfil atualizado
    updated_user = await db.users.find_one({"id": current_user.id})
    return UserProfile(**updated_user)

@router.post("/me/avatar")
async def upload_avatar(file: UploadFile = File(...), db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Validar tipo de arquivo
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Upload para S3
    avatar_url = await upload_image_to_s3(file, f"users/{current_user.id}/avatar")
    
    # Atualizar perfil do usuário
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"avatar": avatar_url}}
    )
    
    return {"avatar_url": avatar_url}

@router.post("/me/cover")
async def upload_cover_photo(file: UploadFile = File(...), db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Validar tipo de arquivo
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Upload para S3
    cover_url = await upload_image_to_s3(file, f"users/{current_user.id}/cover")
    
    # Atualizar perfil do usuário
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"cover_photo": cover_url}}
    )
    
    return {"cover_url": cover_url}

@router.put("/me/privacy")
async def update_privacy_settings(privacy_settings: dict, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Validar configurações de privacidade
    valid_settings = {}
    for key, value in privacy_settings.items():
        if key in ["profile", "posts", "friends", "photos"] and value in ["public", "friends", "private"]:
            valid_settings[key] = value
    
    if valid_settings:
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {f"privacy_settings.{k}": v for k, v in valid_settings.items()}}
        )
    
    # Retornar configurações atualizadas
    updated_user = await db.users.find_one({"id": current_user.id})
    return {"privacy_settings": updated_user["privacy_settings"]}

@router.post("/me/life-events")
async def add_life_event(event_data: dict, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Validar dados do evento
    required_fields = ["event", "date"]
    for field in required_fields:
        if field not in event_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Adicionar ID e timestamp ao evento
    event_data["id"] = str(uuid.uuid4())
    event_data["created_at"] = datetime.utcnow().isoformat()
    
    # Adicionar evento à lista de eventos do usuário
    await db.users.update_one(
        {"id": current_user.id},
        {"$push": {"life_events": event_data}}
    )
    
    return event_data

@router.delete("/me/life-events/{event_id}")
async def delete_life_event(event_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Remover evento da lista de eventos do usuário
    result = await db.users.update_one(
        {"id": current_user.id},
        {"$pull": {"life_events": {"id": event_id}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Event deleted successfully"}

@router.post("/me/achievements")
async def add_achievement(achievement_data: dict, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Validar dados da conquista
    required_fields = ["icon", "label", "description"]
    for field in required_fields:
        if field not in achievement_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Adicionar ID e timestamp à conquista
    achievement_data["id"] = str(uuid.uuid4())
    achievement_data["created_at"] = datetime.utcnow().isoformat()
    
    # Adicionar conquista à lista de conquistas do usuário
    await db.users.update_one(
        {"id": current_user.id},
        {"$push": {"achievements": achievement_data}}
    )
    
    return achievement_data

@router.get("/search")
async def search_users(query: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar usuários pelo nome ou email
    users = await db.users.find({
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ],
        "id": {"$ne": current_user.id}  # Excluir o usuário atual
    }).limit(20).to_list(20)
    
    # Retornar resultados com informações básicas
    return [{
        "id": user["id"],
        "name": user["name"],
        "avatar": user.get("avatar"),
        "location": user.get("location"),
        "is_verified": user.get("is_verified", False)
    } for user in users]