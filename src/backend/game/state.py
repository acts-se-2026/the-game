# directions:  0 is up, value in radians
# positions:   (0, 0) is top-left, value in pixels

class Player:
    def __init__(self, position):
        self.hp = 100
        self.position = position
        self.last_shot_time = 0 # frame number at which the bullet was shot
        self.direction = 0 


class Bullet:
    def __init__(self, position):
        self.position = position
        self.direction = 0


class State:
    def __init__(self, player_cnt):
        self.current_frame = 0
        self.bullets = []
        
        self.players = []
        for i in range(player_cnt):
            self.players.append(Player((100, 100)))

        
