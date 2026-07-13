from vector import Vec2

# rotations:  0 is up, value in radians
# positions:   (0, 0) is top-left, value in pixels

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

    def __init__(self, pos):
        self.hp = 100
        self.pos = pos
        self.last_shot_time = 0 # frame number at which the bullet was shot
        self.rotation = 0
        self.alive = True

        self.box = Box(self.pos, 10)

        self.movement_dir = Vec2(0, 0)
    
    def kill(self):
        self.alive = False
    
    #here you will only change the movement direction vector and the position will update in step_frame
    def move(self):
        pass

    def hit(self):
        self.hp -= 10




class Bullet:
    speed = 20

    def __init__(self, pos):
        self.pos = pos
        self.movement_dir = Vec2(0, 0)

        self.box = Box(self.pos, Vec2(5, 5))

    #here you will only change the movement direction vector and the position will update in step_frame
    def move(self):
        pass

    def kill(self):
        pass


class State:
    def __init__(self, player_cnt):
        self.current_frame = 0
        self.bullets = []
        self.obstacles = []
        
        self.players = []
        for i in range(player_cnt):
            self.players.append(Player(Vec2(100, 100)))
    
    def end_game(self):
        pass

    def step_frame(self):
        self.current_frame += 1

        player_cnt = 0
        for player in self.players:
            #change position
            player.pos += player.speed * player.movement_dir
            player.box.pos = player.pos

            #check number of players alive
            if player.alive:
                player_cnt+=1
            
        
        for bullet in self.bullets:
            #change position
            bullet.pos += bullet.movement_dir * bullet.speed
            bullet.box.pos = bullet.pos

            #check collision with players
            for player in self.players:
                if Box.area_colliding(player.box, bullet.box):
                    player.hit()
                    bullet.kill()


        if player_cnt <= 1:
            self.end_game()

        
        
        
        

