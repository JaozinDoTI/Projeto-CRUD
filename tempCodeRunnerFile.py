from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext

# --- CONFIGURAÇÃO DO BANCO DE DADOS (SQLite) ---
# Usar SQLAlchemy previne SQL Injection automaticamente (Parameter Binding)
SQLALCHEMY_DATABASE_URL = "sqlite:///./seguranca.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELO (Tabela do Banco) ---
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    verified = Column(Boolean, default=False)

Base.metadata.create_all(bind=engine)

# --- SEGURANÇA (Hash de Senha) ---
# Passlib com Bcrypt é o padrão da indústria para evitar vazamento de senhas em texto puro
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- SCHEMAS (Validação de Dados - Pydantic) ---
# Garante que o backend só aceite dados no formato correto
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- APP FASTAPI ---
app = FastAPI()

# Configuração de CORS (Permite que seu HTML acesse este servidor)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, troque "*" pela URL do seu front-end
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependência para pegar a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ROTAS ---

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Verifica se e-mail já existe
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    # 2. Cria hash da senha (Segurança)
    hashed_pw = get_password_hash(user.password)
    
    # 3. Salva no banco
    new_user = UserModel(name=user.name, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Usuário criado com sucesso", "email": new_user.email}

@app.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # 1. Busca usuário (SQLAlchemy previne SQL Injection aqui)
    user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    
    # 2. Verifica existência e Senha (Hash)
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    # Em um sistema real, aqui retornaríamos um JWT Token
    return {
        "message": "Login realizado com sucesso",
        "user_name": user.name,
        "token": "token_falso_simulacao_jwt" 
    }

# Roda o servidor se executar o arquivo diretamente
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)