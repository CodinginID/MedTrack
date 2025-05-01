from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import List
from pydantic import BaseModel
import os
from twilio.rest import Client
import random

app = FastAPI()
security = HTTPBearer()

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
    nama = Column(String(100), nullable=False)
    jenis_layanan = Column(String(100), nullable=False)
    spesialisasi = Column(String(100), nullable=False)
    jam_praktek = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Tambahkan relasi dengan Queue
    queues = relationship("Queue", back_populates="doctor", cascade="all, delete-orphan")


class Queue(Base):
    __tablename__ = "queues"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"))
    queue_number = Column(Integer)
    estimated_time = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Tambahkan relasi balik ke Doctor
    doctor = relationship("Doctor", back_populates="queues")

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

class Login(BaseModel):
    username:str = "admin2@gmail.com"
    password:str = "password123"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str

class DoctorBase(BaseModel):
    nama: str
    jenis_layanan: str
    spesialisasi: str
    jam_praktek: str
    is_active: bool = True

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(DoctorBase):
    pass

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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token tidak valid")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token tidak valid")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
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
    # Check if user already exists
    existing_user = db.query(User).filter((User.email == user.email) | (User.name == user.name)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    hashed_password = pwd_context.hash(user.password)
    db_user = User(name=user.name, email=user.email, password=hashed_password, phone=user.phone)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered"}

@app.post("/auth/login", response_model=dict)
def login(form_data: Login, db: Session = Depends(get_db)):
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
def create_queue(
    queue: QueueCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Validasi dokter
    doctor = db.query(Doctor).filter(Doctor.id == queue.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Dokter tidak ditemukan")

    # Hitung nomor antrian
    last_queue = db.query(Queue).filter(
        Queue.doctor_id == queue.doctor_id,
        Queue.created_at >= datetime.now().date()
    ).order_by(Queue.queue_number.desc()).first()
    
    queue_number = last_queue.queue_number + 1 if last_queue else 1
    estimated_time = datetime.utcnow() + timedelta(minutes=queue_number * 15)
    
    # Buat antrian baru
    db_queue = Queue(
        user_id=current_user.id,
        doctor_id=queue.doctor_id,
        queue_number=queue_number,
        estimated_time=estimated_time,
        service_type=queue.service_type,
        schedule=queue.schedule
    )
    
    db.add(db_queue)
    db.commit()
    db.refresh(db_queue)
    
    # Kirim notifikasi WhatsApp
    try:
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        message = (
            f"Nomor antrian Anda: {queue_number}\n"
            f"Layanan: {queue.service_type}\n"
            f"Dokter: {doctor.name}\n"
            f"Jadwal: {queue.schedule}\n"
            f"Estimasi waktu: {estimated_time.strftime('%H:%M')}"
        )
        client.messages.create(
            body=message,
            from_=f"whatsapp:{TWILIO_PHONE}",
            to=f"whatsapp:{current_user.phone}"
        )
    except Exception as e:
        print(f"Error sending WhatsApp notification: {e}")
    
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


# Create Doctor
@app.post("/doctors", response_model=DoctorResponse)
def create_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_doctor = Doctor(**doctor.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

# Get All Doctors
@app.get("/doctors", response_model=List[DoctorResponse])
def get_doctors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    doctors = db.query(Doctor).offset(skip).limit(limit).all()
    return doctors

# Get Doctor by ID
@app.get("/doctors/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if doctor is None:
        raise HTTPException(status_code=404, detail="Dokter tidak ditemukan")
    return doctor

# Update Doctor
@app.put("/doctors/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: int,
    doctor_update: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Dokter tidak ditemukan")
    
    for key, value in doctor_update.dict().items():
        setattr(db_doctor, key, value)
    
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

# Delete Doctor (Soft Delete)
@app.delete("/doctors/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if db_doctor is None:
        raise HTTPException(status_code=404, detail="Dokter tidak ditemukan")
    
    db_doctor.is_active = False
    db.commit()
    return {"message": "Dokter berhasil dinonaktifkan"}