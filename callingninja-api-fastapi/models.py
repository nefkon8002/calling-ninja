# coding: utf-8
from sqlalchemy import Column, String, Table
from sqlalchemy.dialects.mysql import BIGINT, BIT, DATETIME, INTEGER
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class CallingninjaUser(Base):
    __tablename__ = 'callingninja_user'

    id = Column(INTEGER(11), primary_key=True)
    active = Column(BIT(1))
    address = Column(String(255))
    age = Column(INTEGER(11), nullable=False)
    balance = Column(String(255))
    company = Column(String(255))
    dni = Column(String(255))
    email = Column(String(255))
    eye_color = Column(String(255))
    family_name = Column(String(255))
    first_name = Column(String(255))
    guid = Column(String(255))
    last_name = Column(String(255))
    mobile = Column(String(255), nullable=False, unique=True)
    password = Column(String(255))
    picture = Column(String(255))
    registration_date = Column(DATETIME(fsp=6))
    role = Column(String(255))


t_hibernate_sequence = Table(
    'hibernate_sequence', metadata,
    Column('next_val', BIGINT(20))
)
