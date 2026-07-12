# rotations:  0 is up, value in radians
# positions:   (0, 0) is top-left, value in pixels

class Box:
    def __init__(self, pos, size):
        self.pos = pos
        self.size = size


def area_colliding(box1, box2):
    x1, y1 = box1.pos
    x2, y2 = box2.pos
    return not (
        (x1 + box1.size[0] < x2) # x1 is too much to the left, so it doesn't collide
        or (x1 > x2 + box2.size[0]) # x1 is too much to the right, so it doesn't collide
    ) or (
        (y1 + box1.size[1] < y2) # y1 is too far down, so it doesn't collide
        or (y1 > y2 + box2.size[1]) # y1 is too far up, so it doesn't collide
    )


class Player:
    speed = 10

    def __init__(self, pos):
        self.hp = 100
        self.pos = pos
        self.last_shot_time = 0 # frame number at which the bullet was shot
        self.rotation = 0

        self.movement = (0, 0)
    
    def move(self):
        self.pos += (movement[0] * self.speed, movement[1] * self.speed)




class Bullet:
    def __init__(self, pos):
        self.pos = pos
        self.direction = 0


class State:
    def __init__(self, player_cnt):
        self.current_frame = 0
        self.bullets = []
        self.obstacles = []
        
        self.players = []
        for i in range(player_cnt):
            self.players.append(Player((100, 100)))

    def step_frame(self):
        self.current_frame += 1

        for player in players:
            player.move()
        
        for bullet in bullets:
            bullet.move()

