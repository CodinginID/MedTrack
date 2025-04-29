from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import List
from pydantic import BaseModel
import os
from twilio.rest import Client
import random

app = FastAPI()

# Database
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost:5432/hospital"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Twilio
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_TOKEN = os.getenv("TWILIO_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE", "+14155238886")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(String)

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialty = Column(String)

class Queue(Base):
    __tablename__ = "queues"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    queue_number = Column(Integer)
    estimated_time = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    queue_id = Column(Integer, ForeignKey("queues.id"))
    amount = Column(Integer)
    payment_method = Column(String)
    transaction_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialty: str

class QueueCreate(BaseModel):
    doctor_id: int

class QueueResponse(BaseModel):
    id: int
    queue_number: int
    estimated_time: datetime
    phone: str

class PaymentCreate(BaseModel):
    queue_id: int
    payment_method: str
    amount: int

class PaymentResponse(BaseModel):
    transaction_id: str

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Authentication
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(name=user.name, email=user.email, password=hashed_password, phone=user.phone)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Doctors
@app.get("/doctors", response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    return db.query(Doctor).all()

@app.get("/doctors/{doctor_id}/schedule")
def get_doctor_schedule(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"schedule": f"{doctor.name} available today from 08:00 to 16:00"}

# Queues
@app.post("/queues", response_model=QueueResponse)
def create_queue(queue: QueueCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    last_queue = db.query(Queue).filter(Queue.doctor_id == queue.doctor_id).order_by(Queue.queue_number.desc()).first()
    queue_number = last_queue.queue_number + 1 if last_queue else 1
    estimated_time = datetime.utcnow() + timedelta(minutes=queue_number * 15)
    db_queue = Queue(
        user_id=current_user.id,
        doctor_id=queue.doctor_id,
        queue_number=queue_number,
        estimated_time=estimated_time
    )
    db.add(db_queue)
    db.commit()
    db.refresh(db_queue)
    
    # Send WhatsApp notification
    client = Client(TWILIO_SID, TWILIO_TOKEN)
    message = f"Your queue number is {queue_number}. Estimated time: {estimated_time.strftime('%H:%M')}"
    client.messages.create(
        body=message,
        from_=f"whatsapp:{TWILIO_PHONE}",
        to=f"whatsapp:{current_user.phone}"
    )
    
    return {
        "id": db_queue.id,
        "queue_number": db_queue.queue_number,
        "estimated_time": db_queue.estimated_time,
        "phone": current_user.phone
    }

# Payments
@app.post("/payments", response_model=PaymentResponse)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    queue = db.query(Queue).filter(Queue.id == payment.queue_id, Queue.user_id == current_user.id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    transaction_id = f"TXN-{random.randint(1000, 9999)}"
    db_payment = Payment(
        queue_id=payment.queue_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        transaction_id=transaction_id
    )
    db.add(db_payment)
    db.commit()
    return {"transaction_id": transaction_id}