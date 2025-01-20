from flask_security import  SQLAlchemySessionUserDatastore
from .model import db,User,Role

datastore=SQLAlchemySessionUserDatastore(db.session,User,Role)
