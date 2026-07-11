**Requirements for the Server**

# 1. Stack
- Python
- Fastapi
- Socket.io??? (we still need to decide if we want to use fastapi websockets or socketio library)

# 2. What the server needs to keep and calculate
- Game state:
    1. Position of players, bullets etc
    2. Player data like HP, kills etc
- Calculate the next Game state (run physics and prevent cheating with defined rules)
- Listen to user commands and do the stuff needed 

# 3. The server needs to authenticate the user from the client side and keep a connection with the client side

# 4. If we add a database the server is responsible for managing the db state (migrations etc) 
