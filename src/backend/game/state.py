from game.vector import Vec2

# rotations:  0 is up, value in radians
# positions:  (0, 0) is top-left, value in pixels

class Box:
    def __init__(self, pos, size):
        self.pos = pos
        self.size = size

    def area_colliding(box1, box2):
        return not (
            (box1.x + box1.size.x < box2.x) # x1 is too much to the left, so it doesn't collide
            or (box1.x > box2.x + box2.size.x) # x1 is too much to the right, so it doesn't collide
        ) or (
            (box1.y + box1.size.y < box2.y) # y1 is too far down, so it doesn't collide
            or (box1.y > box2.y + box2.size.y) # y1 is too far up, so it doesn't collide
        )


class Player:
    speed = 10

    def __init__(self, pos, uuid):
        self.uuid = uuid

        self.hp = 100
        self.pos = pos
        self.last_shot_time = 0 # frame number at which the bullet was shot
        self.rotation = 0

        self.box = Box(self.pos, 10)

        self.movement_dir = Vec2(0, 0)
    
    #here you will only change the movement direction vector and the position will update in step_frame
    def set_movement_dir(self, movement_dir):
        self.movement_dir = movement_dir.normalized_or_zero()

    def hit(self):
        self.hp -= 10




class Bullet:
    speed = 20

    def __init__(self, pos):
        self.pos = pos
        self.movement_dir = Vec2(0, 0)

        self.box = Box(self.pos, Vec2(5, 5))

    #here you will only change the movement direction vector and the position will update in step_frame
    def set_movement_dir(self, movement_dir):
        self.movement_dir = movement_dir.normalized_or_zero()


class State:
    def __init__(self, player_uuids):
        self.current_frame = 0
        self.bullets = []
        self.obstacles = []
        
        self.players = []
        for uuid in player_uuids:
            self.players.append(Player(uuid, Vec2(100, 100)))

    # Called from outside
    def set_player_movement_dir(self, player_uuid, direction):
        for player in self.players:
            if player.uuid == player_uuid:
                player.set_movement_dir(direction)
        
    # Called from outside
    def step_frame(self):
        self.current_frame += 1

        for player in self.players:
            #change position
            player.pos += player.speed * player.movement_dir
            player.box.pos = player.pos
        
        # remove dead players
        self.players = [player for player in self.players if player.hp > 0]

        
        killed_bullets = set()            
        for bullet in self.bullets:
            #change position
            bullet.pos += bullet.movement_dir * bullet.speed
            bullet.box.pos = bullet.pos

            #check collision with players
            for player in self.players:
                if Box.area_colliding(player.box, bullet.box):
                    player.hit()
                    killed_bullets.add(bullet)
                    break # this bullet cannot hit any other players

        # remove killed bullets
        self.bullets = [bullet for bullet in self.bullets if bullet in killed_bullets]


        if len(self.players) <= 1:
            self.end_game()
        

    def end_game(self):
        pass
        
        
        

