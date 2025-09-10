from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import uuid
from datetime import datetime

from models import Notification, NotificationType
from auth import get_current_active_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[dict])
async def get_notifications(skip: int = 0, limit: int = 20, db: AsyncIOMotorClient = Depends(), current_user = Depends(get_current_active_user)):
    """
    Retorna as notificações do usuário atual, ordenadas por data (mais recentes primeiro)
    """
    notifications = await db.notifications.find({
        "recipient_id": current_user.id
    }).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Adicionar informações do remetente para cada notificação
    result = []
    for notification in notifications:
        # Buscar informações do remetente
        sender = await db.users.find_one({"id": notification["sender_id"]})
        
        notification_dict = {
            "id": notification["id"],
            "type": notification["type"],
            "message": notification["message"],
            "reference_id": notification.get("reference_id"),
            "is_read": notification.get("is_read", False),
            "created_at": notification["created_at"],
            "sender": {
                "id": sender["id"],
                "name": sender["name"],
                "avatar": sender.get("avatar")
            } if sender else None
        }
        result.append(notification_dict)
    
    return result

@router.get("/unread-count")
async def get_unread_notifications_count(db: AsyncIOMotorClient = Depends(), current_user = Depends(get_current_active_user)):
    """
    Retorna o número de notificações não lidas do usuário atual
    """
    count = await db.notifications.count_documents({
        "recipient_id": current_user.id,
        "is_read": False
    })
    
    return {"count": count}

@router.put("/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, db: AsyncIOMotorClient = Depends(), current_user = Depends(get_current_active_user)):
    """
    Marca uma notificação específica como lida
    """
    # Verificar se a notificação existe e pertence ao usuário atual
    notification = await db.notifications.find_one({
        "id": notification_id,
        "recipient_id": current_user.id
    })
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Marcar como lida
    await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_notifications_as_read(db: AsyncIOMotorClient = Depends(), current_user = Depends(get_current_active_user)):
    """
    Marca todas as notificações do usuário atual como lidas
    """
    await db.notifications.update_many(
        {"recipient_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, db: AsyncIOMotorClient = Depends(), current_user = Depends(get_current_active_user)):
    """
    Exclui uma notificação específica
    """
    # Verificar se a notificação existe e pertence ao usuário atual
    notification = await db.notifications.find_one({
        "id": notification_id,
        "recipient_id": current_user.id
    })
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Excluir notificação
    await db.notifications.delete_one({"id": notification_id})
    
    return {"message": "Notification deleted"}

@router.delete("/")
async def delete_all_notifications(db: AsyncIOMotorClient = Depends(), current_user = Depends(get_current_active_user)):
    """
    Exclui todas as notificações do usuário atual
    """
    await db.notifications.delete_many({"recipient_id": current_user.id})
    
    return {"message": "All notifications deleted"}

# Função auxiliar para criar notificações (pode ser usada por outros módulos)
async def create_notification(db: AsyncIOMotorClient, recipient_id: str, sender_id: str, 
                             notification_type: NotificationType, reference_id: str = None, 
                             message: str = None):
    """
    Cria uma nova notificação
    """
    # Gerar mensagem padrão se não for fornecida
    if not message:
        # Buscar informações do remetente
        sender = await db.users.find_one({"id": sender_id})
        sender_name = sender["name"] if sender else "Someone"
        
        # Gerar mensagem com base no tipo de notificação
        if notification_type == NotificationType.FRIEND_REQUEST:
            message = f"{sender_name} sent you a friend request"
        elif notification_type == NotificationType.FRIEND_ACCEPT:
            message = f"{sender_name} accepted your friend request"
        elif notification_type == NotificationType.POST_LIKE:
            message = f"{sender_name} liked your post"
        elif notification_type == NotificationType.POST_COMMENT:
            message = f"{sender_name} commented on your post"
        elif notification_type == NotificationType.COMMENT_LIKE:
            message = f"{sender_name} liked your comment"
        elif notification_type == NotificationType.POST_SHARE:
            message = f"{sender_name} shared your post"
        else:
            message = f"You have a new notification from {sender_name}"
    
    # Criar notificação
    notification = Notification(
        recipient_id=recipient_id,
        sender_id=sender_id,
        type=notification_type,
        reference_id=reference_id,
        message=message
    )
    
    # Salvar no banco de dados
    await db.notifications.insert_one(notification.dict())
    
    return notification.dict()