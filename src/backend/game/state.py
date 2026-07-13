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
        self.alive = True

        self.box = Box(self.pos, 10)

        self.movement = (0, 0)
    
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
        self.movement = (0, 0)

        self.box = Box(self.pos, 5)

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
            self.players.append(Player((100, 100)))
    
    def end_game(self):
        pass

    def step_frame(self):
        self.current_frame += 1

        player_cnt = 0
        for player in players:
            #change position
            player.pos += (movement[0] * player.speed, movement[1] * player.speed)
            player.box.pos = player.pos

            #check number of players alive
            if player.alive:
                player_cnt+=1
            
        
        for bullet in bullets:
            #change position
            bullet.pos += (movement[0] * bullet.speed, movement[1] * bullet.speed)
            bullet.box.pos = bullet.pos

            #check collision with players
            for player in players:
                if Box.area_colliding(player.box, bullet.box):
                    player.hit()
                    bullet.kill()


        if player_cnt <= 1:
            end_game()



        
        
        
        

