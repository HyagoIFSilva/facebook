from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from datetime import datetime

from models import FriendRequest, FriendRequestCreate, FriendRequestUpdate, UserProfile, NotificationType
from auth import get_current_active_user

router = APIRouter(prefix="/friends", tags=["friends"])

@router.post("/requests", status_code=status.HTTP_201_CREATED)
async def send_friend_request(request_data: FriendRequestCreate, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Verificar se o destinatário existe
    recipient = await db.users.find_one({"id": request_data.recipient_id})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Verificar se já existe uma solicitação pendente
    existing_request = await db.friend_requests.find_one({
        "$or": [
            {"requester_id": current_user.id, "recipient_id": request_data.recipient_id},
            {"requester_id": request_data.recipient_id, "recipient_id": current_user.id}
        ]
    })
    
    if existing_request:
        if existing_request["status"] == "pending":
            raise HTTPException(status_code=400, detail="Friend request already exists")
        elif existing_request["status"] == "accepted":
            raise HTTPException(status_code=400, detail="You are already friends")
    
    # Criar nova solicitação
    friend_request = FriendRequest(
        requester_id=current_user.id,
        recipient_id=request_data.recipient_id
    )
    
    await db.friend_requests.insert_one(friend_request.dict())
    
    # Criar notificação para o destinatário
    notification = {
        "id": str(uuid.uuid4()),
        "recipient_id": request_data.recipient_id,
        "sender_id": current_user.id,
        "type": NotificationType.FRIEND_REQUEST,
        "reference_id": friend_request.id,
        "message": f"{current_user.name} sent you a friend request",
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    
    await db.notifications.insert_one(notification)
    
    return {"message": "Friend request sent successfully"}

@router.get("/requests", response_model=List[dict])
async def get_friend_requests(db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar solicitações recebidas pendentes
    requests = await db.friend_requests.find({
        "recipient_id": current_user.id,
        "status": "pending"
    }).to_list(100)
    
    # Adicionar informações do solicitante
    result = []
    for request in requests:
        requester = await db.users.find_one({"id": request["requester_id"]})
        if requester:
            result.append({
                "request_id": request["id"],
                "requester": {
                    "id": requester["id"],
                    "name": requester["name"],
                    "avatar": requester.get("avatar")
                },
                "created_at": request["created_at"]
            })
    
    return result

@router.put("/requests/{request_id}")
async def respond_to_friend_request(request_id: str, response: FriendRequestUpdate, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar solicitação
    request = await db.friend_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    # Verificar se o usuário atual é o destinatário
    if request["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to respond to this request")
    
    # Atualizar status da solicitação
    await db.friend_requests.update_one(
        {"id": request_id},
        {"$set": {"status": response.status, "updated_at": datetime.utcnow()}}
    )
    
    # Se aceita, criar notificação para o solicitante
    if response.status == "accepted":
        # Criar notificação
        notification = {
            "id": str(uuid.uuid4()),
            "recipient_id": request["requester_id"],
            "sender_id": current_user.id,
            "type": NotificationType.FRIEND_ACCEPT,
            "reference_id": request_id,
            "message": f"{current_user.name} accepted your friend request",
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        
        await db.notifications.insert_one(notification)
    
    return {"message": f"Friend request {response.status}"}

@router.get("/", response_model=List[dict])
async def get_friends(db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar amizades aceitas
    friendships = await db.friend_requests.find({
        "$or": [
            {"requester_id": current_user.id, "status": "accepted"},
            {"recipient_id": current_user.id, "status": "accepted"}
        ]
    }).to_list(1000)
    
    # Buscar informações dos amigos
    friends = []
    for friendship in friendships:
        friend_id = friendship["recipient_id"] if friendship["requester_id"] == current_user.id else friendship["requester_id"]
        friend = await db.users.find_one({"id": friend_id})
        
        if friend:
            friends.append({
                "id": friend["id"],
                "name": friend["name"],
                "avatar": friend.get("avatar"),
                "location": friend.get("location"),
                "is_verified": friend.get("is_verified", False),
                "friendship_id": friendship["id"],
                "since": friendship["updated_at"]
            })
    
    return friends

@router.delete("/friends/{friendship_id}")
async def remove_friend(friendship_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar amizade
    friendship = await db.friend_requests.find_one({"id": friendship_id})
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    # Verificar se o usuário atual é parte da amizade
    if current_user.id not in [friendship["requester_id"], friendship["recipient_id"]]:
        raise HTTPException(status_code=403, detail="Not authorized to remove this friendship")
    
    # Remover amizade
    await db.friend_requests.delete_one({"id": friendship_id})
    
    return {"message": "Friend removed successfully"}

@router.get("/suggestions", response_model=List[dict])
async def get_friend_suggestions(db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Buscar amigos atuais
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
    
    # Buscar amigos de amigos que não são amigos do usuário atual
    suggestions = []
    for friend_id in friend_ids:
        friend_of_friend_ships = await db.friend_requests.find({
            "$or": [
                {"requester_id": friend_id, "status": "accepted"},
                {"recipient_id": friend_id, "status": "accepted"}
            ]
        }).to_list(100)
        
        for friendship in friend_of_friend_ships:
            suggestion_id = friendship["recipient_id"] if friendship["requester_id"] == friend_id else friendship["requester_id"]
            
            # Verificar se não é o usuário atual e não é um amigo atual
            if suggestion_id != current_user.id and suggestion_id not in friend_ids:
                # Verificar se já existe uma solicitação pendente
                existing_request = await db.friend_requests.find_one({
                    "$or": [
                        {"requester_id": current_user.id, "recipient_id": suggestion_id},
                        {"requester_id": suggestion_id, "recipient_id": current_user.id}
                    ]
                })
                
                if not existing_request:
                    suggestion = await db.users.find_one({"id": suggestion_id})
                    if suggestion:
                        # Contar amigos em comum
                        mutual_friends = [fid for fid in friend_ids if fid in [friendship["requester_id"], friendship["recipient_id"]]]
                        
                        suggestions.append({
                            "id": suggestion["id"],
                            "name": suggestion["name"],
                            "avatar": suggestion.get("avatar"),
                            "location": suggestion.get("location"),
                            "mutual_friends": len(mutual_friends)
                        })
    
    # Remover duplicatas e ordenar por número de amigos em comum
    unique_suggestions = {}
    for suggestion in suggestions:
        if suggestion["id"] not in unique_suggestions or suggestion["mutual_friends"] > unique_suggestions[suggestion["id"]]["mutual_friends"]:
            unique_suggestions[suggestion["id"]] = suggestion
    
    return sorted(list(unique_suggestions.values()), key=lambda x: x["mutual_friends"], reverse=True)[:20]

@router.get("/{user_id}/mutual", response_model=List[dict])
async def get_mutual_friends(user_id: str, db: AsyncIOMotorClient = Depends(), current_user: UserProfile = Depends(get_current_active_user)):
    # Verificar se o usuário existe
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Buscar amigos do usuário atual
    current_user_friendships = await db.friend_requests.find({
        "$or": [
            {"requester_id": current_user.id, "status": "accepted"},
            {"recipient_id": current_user.id, "status": "accepted"}
        ]
    }).to_list(1000)
    
    current_user_friend_ids = []
    for friendship in current_user_friendships:
        friend_id = friendship["recipient_id"] if friendship["requester_id"] == current_user.id else friendship["requester_id"]
        current_user_friend_ids.append(friend_id)
    
    # Buscar amigos do outro usuário
    other_user_friendships = await db.friend_requests.find({
        "$or": [
            {"requester_id": user_id, "status": "accepted"},
            {"recipient_id": user_id, "status": "accepted"}
        ]
    }).to_list(1000)
    
    other_user_friend_ids = []
    for friendship in other_user_friendships:
        friend_id = friendship["recipient_id"] if friendship["requester_id"] == user_id else friendship["requester_id"]
        other_user_friend_ids.append(friend_id)
    
    # Encontrar amigos em comum
    mutual_friend_ids = [fid for fid in current_user_friend_ids if fid in other_user_friend_ids]
    
    # Buscar informações dos amigos em comum
    mutual_friends = []
    for friend_id in mutual_friend_ids:
        friend = await db.users.find_one({"id": friend_id})
        if friend:
            mutual_friends.append({
                "id": friend["id"],
                "name": friend["name"],
                "avatar": friend.get("avatar"),
                "location": friend.get("location"),
                "is_verified": friend.get("is_verified", False)
            })
    
    return mutual_friends