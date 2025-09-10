from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from models import UserCreate, UserLogin, Token, UserProfile, PasswordReset, PasswordUpdate
from auth import (
    authenticate_user, create_access_token, get_password_hash, 
    ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user
)

router = APIRouter(prefix="/auth", tags=["auth"])

# Função para enviar email de recuperação de senha
async def send_password_reset_email(email: str, token: str):
    sender_email = os.environ.get("EMAIL_USER")
    sender_password = os.environ.get("EMAIL_PASSWORD")
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "Recuperação de Senha - Facebook Clone"
    message["From"] = sender_email
    message["To"] = email
    
    reset_url = f"{os.environ.get('FRONTEND_URL')}/reset-password?token={token}"
    
    text = f"""Olá,
    
    Você solicitou a recuperação de senha para sua conta no Facebook Clone.
    Para redefinir sua senha, clique no link abaixo:
    
    {reset_url}
    
    Se você não solicitou esta recuperação, ignore este email.
    
    Atenciosamente,
    Equipe Facebook Clone
    """
    
    html = f"""
    <html>
      <body>
        <h2>Recuperação de Senha - Facebook Clone</h2>
        <p>Olá,</p>
        <p>Você solicitou a recuperação de senha para sua conta no Facebook Clone.</p>
        <p>Para redefinir sua senha, clique no botão abaixo:</p>
        <p>
          <a href="{reset_url}" style="background-color: #1877f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Redefinir Senha
          </a>
        </p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Facebook Clone</p>
      </body>
    </html>
    """
    
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    
    message.attach(part1)
    message.attach(part2)
    
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, message.as_string())
        server.quit()
    except Exception as e:
        print(f"Error sending email: {e}")

@router.post("/register", response_model=Token)
async def register_user(user: UserCreate, db: AsyncIOMotorClient = Depends()):
    # Verificar se o email já existe
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Criar novo usuário
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_data = UserProfile(
        id=user_id,
        email=user.email,
        name=user.name,
        avatar=None,
        cover_photo=None
    )
    
    # Adicionar o usuário ao banco de dados
    user_dict = user_data.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Gerar token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id,
        name=user.name
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorClient = Depends()):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        avatar=user.avatar
    )

@router.post("/password-reset")
async def request_password_reset(reset_data: PasswordReset, background_tasks: BackgroundTasks, db: AsyncIOMotorClient = Depends()):
    # Verificar se o email existe
    user = await db.users.find_one({"email": reset_data.email})
    if not user:
        # Não informamos ao usuário se o email existe ou não por segurança
        return {"message": "If your email is registered, you will receive a password reset link"}
    
    # Gerar token de recuperação
    reset_token = str(uuid.uuid4())
    
    # Salvar token no banco de dados com expiração
    await db.password_resets.insert_one({
        "email": reset_data.email,
        "token": reset_token,
        "expires_at": datetime.utcnow() + timedelta(hours=1)
    })
    
    # Enviar email em background
    background_tasks.add_task(send_password_reset_email, reset_data.email, reset_token)
    
    return {"message": "If your email is registered, you will receive a password reset link"}

@router.post("/password-update")
async def update_password(password_data: PasswordUpdate, db: AsyncIOMotorClient = Depends()):
    # Verificar se o token é válido
    reset_record = await db.password_resets.find_one({
        "token": password_data.token,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    # Atualizar senha do usuário
    hashed_password = get_password_hash(password_data.new_password)
    await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"password": hashed_password}}
    )
    
    # Remover token usado
    await db.password_resets.delete_one({"token": password_data.token})
    
    return {"message": "Password updated successfully"}

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: UserProfile = Depends(get_current_active_user)):
    return current_user