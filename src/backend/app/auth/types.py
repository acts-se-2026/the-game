from pydantic import BaseModel

class SessionPayload(BaseModel):
    username: str
    session_id: str
    exp: int