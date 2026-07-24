import math
import random

from game.vector import Vec2

# rotations:  0 is right, value is in clockwise radians
# positions:  (0, 0) is top-left, value in pixels

LEVEL_SIZE = Vec2(1280, 720)
GRID_SIZE = Vec2(16, 9)
GRID_BOX_SIZE = Vec2(LEVEL_SIZE.x/GRID_SIZE.x, LEVEL_SIZE.y/GRID_SIZE.y)

OBSTACLE_CNT_MIN = 20
OBSTACLE_CNT_MAX = 45

PLAYER_SIZE = Vec2(36, 36)
CANNON_END_RADIUS = 36//2 + 16
PLAYER_SPEED = 5
SHOOTING_DELAY = 5

BULLET_SPEED = 10
BULLET_SIZE = Vec2(5, 5)

ENABLE_CHESTS = False
HEALTH_CHEST_SIZE = Vec2(20, 20)
CHEST_SPAWN_DELAY = 200


class HealthChest:
    def __init__(self, pos):
        self.pos = pos
        self.health = 50

        self.size = HEALTH_CHEST_SIZE
        self.box = Box(self.pos - HEALTH_CHEST_SIZE / 2, HEALTH_CHEST_SIZE)

        self.used = False
    
    def to_dict(self):
        return {
            "x": self.pos.x,
            "y": self.pos.y,
            "size": {
                "x": self.size.x,
                "y": self.size.y
            }
        }

class Box:
    def __init__(self, pos: Vec2, size: Vec2):
        self.pos = pos
        self.size = size

    def area_colliding(box1: Box, box2: Box):
        return not (
            box1.pos.x + box1.size.x <= box2.pos.x # 1 is too much to the left, so it doesn't collide
            or box1.pos.x >= box2.pos.x + box2.size.x # 1 is too much to the right, so it doesn't collide
            or box1.pos.y + box1.size.y <= box2.pos.y # 1 is too far up, so it doesn't collide
            or box1.pos.y >= box2.pos.y + box2.size.y # 1 is too far down, so it doesn't collide
        )


class Player:
    def __init__(self, uuid: str, pos: Vec2):
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
        return Box(self.pos - PLAYER_SIZE // 2, PLAYER_SIZE)

    def to_dict(self):
        return {
            "id": self.uuid,
            "x": self.pos.x,
            "y": self.pos.y,
            "heading": self.rotation,
            "hp": self.hp,
        }




class Bullet:
    next_id = 0

    def __init__(self, pos: Vec2, movement_dir: Vec2, owner_uuid: str):
        self.pos = pos
        self.movement_dir = movement_dir
        self.owner_uuid = owner_uuid

        self.id = Bullet.next_id
        Bullet.next_id += 1

    def get_collision_box(self):
        return Box(self.pos - BULLET_SIZE / 2, BULLET_SIZE)

    def to_dict(self):
        return {
            "x": self.pos.x,
            "y": self.pos.y,
            "heading": math.atan2(self.movement_dir.y, self.movement_dir.x),
            "ownerId": self.owner_uuid
        }



class StateDiff:
    def __init__(self, players: list[Player], allBullets: list[Bullet], explosion_positions: list[Vec2], allChests : list[HealthChest], deaths: list[dict]):
        self.allBullets = allBullets # list of Bullet
        self.players = players # list of Player
        self.explosion_positions = explosion_positions # list of Vec2
        self.allChests = allChests
        self.deaths = deaths

    def to_dict(self):
        return {
            "players": [player.to_dict() for player in self.players],
            "bullets": [bullet.to_dict() for bullet in self.allBullets],
            "explosion_positions": [pos.to_dict() for pos in self.explosion_positions],
            "chests": [chest.to_dict() for chest in self.allChests],
            "deaths": self.deaths
        }


# Data that needs to be sent once to the client, at the beginning of the game
class GameInfo:
    def __init__(self, level_size: Vec2, obstacles: list[Box]):
        self.level_size = level_size # list of Vec2
        self.obstacles = obstacles # list of Box



# Generates obstacles in a box grid
def obstacle_generator():
    #--CREATES A MAP WITH RANDOM OBSTACLE POSITIONS--#
    while True:
        obstacles = [] # list of Box class
        obstacles_grid_pos = set() #position of each obsticle in grid: (0, 0) is top left (9, 9) would be bottom right

        obstacle_cnt = random.randint(OBSTACLE_CNT_MIN, OBSTACLE_CNT_MAX)
        for i in range(obstacle_cnt):
            x = random.randint(0, GRID_SIZE.x-1)
            y = random.randint(0, GRID_SIZE.y-1)

            while (x, y) in obstacles_grid_pos or State.is_diagonal(x, y, obstacles_grid_pos):
                x = random.randint(0, GRID_SIZE.x-1)
                y = random.randint(0, GRID_SIZE.y-1)

            obstacles_grid_pos.add((x, y))
            obstacles.append(Box(Vec2(x*GRID_BOX_SIZE.x, y*GRID_BOX_SIZE.y), GRID_BOX_SIZE))

        #--CHECKS IF AN AREA IS BLOCKED BY OBSTACLES--#
        if State.check_map_validity(obstacles_grid_pos):
            return obstacles


# Lifetime:
# - __init__ which sets up level data
# - add players
# - do anything you want
class State:
    def __init__(self, player_uuids: list[str] | None = None):
        self.obstacles = []
        if len(player_uuids) > 0:
            self.add_players_at_random_positions(player_uuids)
            self.obstacles = obstacle_generator()

        self.current_frame = 0
        self.bullets = []
        
        self.unsent_bullet_ids = []
        
        self.chests = [] #List of HealthChest Class
        self.players = []

        self.next_chest_spawn = CHEST_SPAWN_DELAY #frame number


    def is_diagonal(x, y, obstacles_grid_pos):
        #This checks if (x, y) obstacle is connected ONLY diagonally with another obstacle
        diagonals = [
            (1, 1), #bottom right
            (-1, 1), #bottom left
            (-1, -1), #top left
            (1, -1) #top right
        ]

        for dx, dy in diagonals:
            if ((x+dx, y+dy) in obstacles_grid_pos and
                (x+dx, y) not in obstacles_grid_pos and
                (x, y+dy) not in obstacles_grid_pos):
                    return True
        
        return False


    
    def check_map_validity(obstacles_grid_pos):
        #This checks whether any areas are seperated by obstacles using flood fill
        visited = set()
        queue = []

        found = False
        for y in range(GRID_SIZE.y):
            for x in range(GRID_SIZE.x):
                if (x, y) not in obstacles_grid_pos:
                    start = (x, y)
                    found=True
                    break
            if found:
                break

        
        visited.add(start)
        queue.append(start)

        while queue:
            x, y = queue.pop(0)

            neighbours = [
                (x+1, y), #right
                (x-1, y), #left
                (x, y+1), #down
                (x, y-1) #up
            ]

            for nx, ny in neighbours:
                #is inside map
                if (0 <= nx <= GRID_SIZE.x-1 and 0 <= ny <= GRID_SIZE.y-1 and
                        (nx , ny) not in obstacles_grid_pos and (nx , ny) not in visited):
                        visited.add((nx, ny))
                        queue.append((nx, ny))

        #All open grids have been filled
        return len(visited) == GRID_SIZE.x*GRID_SIZE.y - len(obstacles_grid_pos)

    def add_players_at_random_positions(self, player_uuids: list[str]):
        for uuid in player_uuids:
            player = Player(uuid, Vec2.ZERO)

            # randomize the starting position 
            while True:
                player.pos = Vec2(random.randint(0, LEVEL_SIZE.x), random.randint(0, LEVEL_SIZE.y))
                if not self.is_box_in_obstacle(player.get_collision_box()):
                    break

            self.players.append(player)

    def add_player(self, player: Player):
        self.players.append(player)
        return player

    def add_health_chest_at_random_position(self):
        x = random.randint(0, LEVEL_SIZE.x)
        y = random.randint(0, LEVEL_SIZE.y)

        chest = HealthChest(Vec2(x, y))

        while self.is_box_in_obstacle(chest.box) or self.is_box_on_player(chest.box):
            x = random.randint(0, LEVEL_SIZE.x)
            y = random.randint(0, LEVEL_SIZE.y)

            chest = HealthChest(Vec2(x, y))
        
        self.chests.append(chest)

    def is_box_on_player(self, box):
        for player in self.players:
            if Box.area_colliding(player.get_collision_box(), box):
                return True
        return False

    # Called from outside
    def get_level_info(self):
        return GameInfo(LEVEL_SIZE, self.obstacles)

    # Called from outside
    def set_player_movement_dir(self, player_uuid: str, direction: Vec2):
        for player in self.players:
            if player.uuid == player_uuid:
                player.movement_dir = direction.normalized_or_zero()

    # Called from outside
    def set_player_rotation(self, player_uuid: str, rotation: float):
        for player in self.players:
            if player.uuid == player_uuid:
                player.rotation = rotation

    def kill_player(self, player_uuid: str):
        for player in self.players:
            if player.uuid == player_uuid:
                player.hp = 0
                return

    # Called from outside
    def try_shoot_player_bullet(self, player_uuid: str):
        print(f"Player {player_uuid} is trying to shoot a bullet at frame {self.current_frame}")
        for player in self.players:
            if player.uuid == player_uuid and self.current_frame - player.last_shot_time > SHOOTING_DELAY:
                direction = player.get_shooting_dir()
                self.bullets.append(Bullet(player.pos + direction * CANNON_END_RADIUS, direction, player.uuid))
                self.unsent_bullet_ids.append(self.bullets[-1].id)
                player.last_shot_time = self.current_frame

        
    # Called from outside
    def step_frame(self):
        self.current_frame += 1

        for player in self.players:
            delta = (PLAYER_SPEED * player.movement_dir).rounded()

            assert player.pos.is_int(), "Collision detection only works with integer coordinates"
            assert not self.is_box_in_obstacle(player.get_collision_box())

            # try moving on the x axis
            for _ in range(abs(delta.x)):
                step = delta.x // abs(delta.x)
                player.pos.x += step
                if self.is_box_in_obstacle(player.get_collision_box()):
                    player.pos.x -= step
                    break

            # try moving on the y axis
            for _ in range(abs(delta.y)):
                step = delta.y // abs(delta.y)
                player.pos.y += step
                if self.is_box_in_obstacle(player.get_collision_box()):
                    player.pos.y -= step
                    break


            #CHECKS COLLISION WITH HEALTH CHEST
            for chest in self.chests:
                if Box.area_colliding(player.get_collision_box(), chest.box):
                    player.hp += chest.health
                    chest.used = True   

        # prepare information about new bullets
        new_bullets = []
        for id in self.unsent_bullet_ids:
            for bullet in self.bullets:
                if bullet.id == id:
                    new_bullets.append(bullet)

        self.unsent_bullet_ids.clear()

        
        removed_bullet_ids = set()
        killers_by_player = {}
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
                    if player.hp <= 0:
                        killers_by_player.setdefault(player.uuid, bullet.owner_uuid)
                    removed_bullet_ids.add(bullet.id)
                    break # this bullet cannot hit any other players

        explosion_positions = []
        deaths = []

        # remove dead players
        alive_players = []
        for player in self.players: 
            if player.hp <= 0:
                explosion_positions.append(player.pos)
                deaths.append({
                    "player_id": player.uuid,
                    "killer_id": killers_by_player.get(player.uuid),
                })
            else:
                alive_players.append(player)

        self.players = alive_players

        if self.current_frame == self.next_chest_spawn:
            self.add_health_chest_at_random_position()
            self.next_chest_spawn += CHEST_SPAWN_DELAY

        # remove dead bullets
        self.bullets = [bullet for bullet in self.bullets if bullet.id not in removed_bullet_ids]
        self.chests = [chest for chest in self.chests if not chest.used]

        if len(self.players) <= 1:
            self.end_game()

        return StateDiff(
            players=self.players,
            allBullets=self.bullets,
            explosion_positions=explosion_positions,
            allChests=self.chests,
            deaths=deaths
        )


    def is_box_in_obstacle(self, box: Box):
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
