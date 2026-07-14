from game.vector import Vec2
import math
import random

# rotations:  0 is right, value is in clockwise radians
# positions:  (0, 0) is top-left, value in pixels

LEVEL_SIZE = Vec2(600, 600)

PLAYER_SIZE = Vec2(30, 30)
PLAYER_SPEED = 10
SHOOTING_DELAY = 5

BULLET_SPEED = 10
BULLET_SIZE = Vec2(5, 5)


class Box:
    def __init__(self, pos, size):
        self.pos = pos
        self.size = size

    def area_colliding(box1, box2):
        return not (
            box1.pos.x + box1.size.x < box2.pos.x # 1 is too much to the left, so it doesn't collide
            or box1.pos.x > box2.pos.x + box2.size.x # 1 is too much to the right, so it doesn't collide
            or box1.pos.y + box1.size.y < box2.pos.y # 1 is too far up, so it doesn't collide
            or box1.pos.y > box2.pos.y + box2.size.y # 1 is too far down, so it doesn't collide
        )


class Player:
    def __init__(self, uuid, pos):
        self.uuid = uuid

        self.hp = 100
        self.pos = pos
        self.last_shot_time = 0 # frame number at which the bullet was shot
        self.rotation = 0

        self.movement_dir = Vec2(0, 0)
    
    def hit(self):
        self.hp -= 10

    def get_shooting_dir(self):
        return Vec2(math.cos(self.rotation), math.sin(self.rotation))

    def get_collision_box(self):
        return Box(self.pos - PLAYER_SIZE / 2, PLAYER_SIZE)
        



class Bullet:
    next_id = 0

    def __init__(self, pos, movement_dir, owner_uuid):
        self.pos = pos
        self.movement_dir = movement_dir
        self.owner_uuid = owner_uuid

        self.id = Bullet.next_id
        Bullet.next_id += 1

    def get_collision_box(self):
        return Box(self.pos - BULLET_SIZE / 2, BULLET_SIZE)



class StateDiff:
    def __init__(self, players, removed_bullet_ids, new_bullets_appended):
        self.removed_bullet_ids = removed_bullet_ids # list of int
        self.new_bullets_appended = new_bullets_appended # list of Bullet
        self.players = players # list of Player


# Data that needs to be sent once to the client, at the beginning of the game
class GameInfo:
    def __init__(self, level_size, obstacles):
        self.level_size = level_size # list of Vec2
        self.obstacles = obstacles # list of Box


class State:
    def __init__(self, player_uuids):
        self.current_frame = 0
        self.bullets = []
        
        self.unsent_bullet_ids = []
        
        self.obstacles = [
            Box(Vec2(250, 0), Vec2(100, 200)),
            Box(Vec2(250, 400), Vec2(100, 200)),
        ]

        self.players = []
        for uuid in player_uuids:
            player = Player(uuid, Vec2.ZERO)

            # randomize the starting position 
            while True:
                player.pos = Vec2(random.random() * LEVEL_SIZE.x, random.random() * LEVEL_SIZE.y)
                if not self.is_box_in_obstacle(player.get_collision_box()):
                    break

            self.players.append(player)

    # Called from outside
    def get_level_info(self):
        return GameInfo(LEVEL_SIZE, self.obstacles)

    # Called from outside
    def set_player_movement_dir(self, player_uuid, direction):
        for player in self.players:
            if player.uuid == player_uuid:
                player.movement_dir = direction

    # Called from outside
    def set_player_rotation(self, player_uuid, rotation):
        for player in self.players:
            if player.uuid == player_uuid:
                player.rotation = rotation

    # Called from outside
    def try_shoot_player_bullet(self, player_uuid):
        for player in self.players:
            if player.uuid == player_uuid and self.current_frame - player.last_shot_time > SHOOTING_DELAY:
                self.bullets.append(Bullet(player.pos, player.get_shooting_dir(), player.uuid))
                self.unsent_bullet_ids.append(self.bullets[-1].id)
                player.last_shot_time = self.current_frame

        
    # Called from outside
    def step_frame(self):
        self.current_frame += 1

        for player in self.players:
            delta = PLAYER_SPEED * player.movement_dir

            # try moving on the x axis
            player.pos.x += delta.x
            if self.is_box_in_obstacle(player.get_collision_box()):
                player.pos.x -= delta.x

            # try moving on the y axis
            player.pos.y += delta.y
            if self.is_box_in_obstacle(player.get_collision_box()):
                player.pos.y -= delta.y

            
        # prepare information about new bullets
        new_bullets = []
        for id in self.unsent_bullet_ids:
            for bullet in self.bullets:
                if bullet.id == id:
                    new_bullets.append(bullet)

        self.unsent_bullet_ids.clear()

        
        removed_bullet_ids = set()            
        for bullet in self.bullets:
            #change position
            bullet.pos += BULLET_SPEED * bullet.movement_dir

            #check collision with obstacles
            if self.is_box_in_obstacle(bullet.get_collision_box()):
                removed_bullet_ids.add(bullet.id)
                continue

            #check collision with players
            for player in self.players:
                if player.uuid == bullet.owner_uuid:
                    continue
                if Box.area_colliding(player.get_collision_box(), bullet.get_collision_box()):
                    player.hit()
                    removed_bullet_ids.add(bullet.id)
                    break # this bullet cannot hit any other players
        
        # remove dead players
        self.players = [player for player in self.players if player.hp > 0]

        # remove dead bullets
        self.bullets = [bullet for bullet in self.bullets if bullet.id not in removed_bullet_ids]

        if len(self.players) <= 1:
            self.end_game()

        return StateDiff(players=self.players, removed_bullet_ids=list(removed_bullet_ids), new_bullets_appended=new_bullets)


    def is_box_in_obstacle(self, box):
        for obstacle_box in self.obstacles:
            if Box.area_colliding(obstacle_box, box):
                return True
        
        return (
            box.pos.x < 0
            or box.pos.y < 0
            or box.pos.x + box.size.x > LEVEL_SIZE.x
            or box.pos.y + box.size.y > LEVEL_SIZE.y
        )
        

    def end_game(self):
        pass
        
        
        

