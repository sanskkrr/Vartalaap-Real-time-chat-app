import firebase_admin
from firebase_admin import credentials, auth
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
import json
from database import create_table, save_message, get_messages

create_table()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, WebSocket] = {}

    async def connect(self, uid: str, websocket: WebSocket):
        await websocket.accept()
        self.active[uid] = websocket

    def disconnect(self, uid: str):
        self.active.pop(uid, None)

    async def send_private(self, message: str, sender_uid: str, recipient_uid: str):
        # Send to recipient
        recipient_ws = self.active.get(recipient_uid)
        if recipient_ws:
            try:
                await recipient_ws.send_text(json.dumps({
                    "from": sender_uid,
                    "message": message
                }))
            except Exception:
                self.disconnect(recipient_uid)

        # Also echo back to sender so they see their own message
        sender_ws = self.active.get(sender_uid)
        if sender_ws:
            try:
                await sender_ws.send_text(json.dumps({
                    "from": sender_uid,        # ← "me"
                    "message": message
                }))
            except Exception:
                self.disconnect(sender_uid)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    try:
        decoded = auth.verify_id_token(token)
        uid = decoded["uid"]
    except Exception as e:
        print(f"Auth failed: {e}")
        await websocket.close(code=1008)
        return

    await manager.connect(uid, websocket)
    print(f"Connected: {uid}")

    try:
        while True:
            # ✅ frontend now sends JSON: { "to": "recipientUID", "message": "hello" }
            raw = await websocket.receive_text()
            data = json.loads(raw)

            recipient_uid = data.get("to")
            message = data.get("message")
            

            if not recipient_uid or not message:
                continue
            save_message(uid, recipient_uid, message)

            await manager.send_private(message, sender_uid=uid, recipient_uid=recipient_uid)

    except WebSocketDisconnect:
        print(f"Disconnected: {uid}")
        manager.disconnect(uid)

    except Exception as e:
        print(f"Unexpected error for {uid}: {e}")
        manager.disconnect(uid)


@app.get("/users")

def get_users():

    users = []

    page = auth.list_users()

    for user in page.users:

        users.append({

            "uid": user.uid,

            "email": user.email

        })

    return users

@app.get("/messages")
def fetch_messages(user1: str, user2: str):
    return get_messages(user1, user2)