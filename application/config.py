class Config(object):
    DEBUG=False
    TESTING= False

class DevelopementConfig(object):
    DEBUG=True
    SQLALCHEMY_DATABASE_URI='sqlite:///data.db'
    SECRET_KEY="thisisoursecretkey"
    SECURITY_PASSWORD_SALT="thisisthesalt"
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    WTF_CSRF_ENABLED=False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authorization'
    CACHE_TYPE='redis'
    CACHE_REDIS_HOST='localhost'
    CACHE_REDIS_PORT=6379
    CACHE_REDIS_DB=0
    CACHE_DEFAULT_TIMEOUT=300

