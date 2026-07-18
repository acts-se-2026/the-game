import pytest
import asyncio
from app.auth.types import SessionPayload
from game.backendConnections.room import Room
from game.state import Player, Box, State
from game.state import PLAYER_SIZE, PLAYER_SPEED, SHOOTING_DELAY, BULLET_SPEED, BULLET_SIZE
from game.vector import Vec2
import math


class FakeWebSocket:
    def __init__(self):
        self.messages = []

    async def send_json(self, message):
        self.messages.append(message)


def test_game_start_includes_player_names():
    async def start_game():
        room = Room('room-id')
        first_socket = FakeWebSocket()
        second_socket = FakeWebSocket()
        room.connect(first_socket, SessionPayload(username='Alice', session_id='player-1', exp=0))
        room.connect(second_socket, SessionPayload(username='Bob', session_id='player-2', exp=0))

        room.startGame()
        await asyncio.sleep(0.01)
        room.stopGame()

        game_start = next(message for message in first_socket.messages if message['type'] == 'game_start')
        assert {(player['id'], player['username']) for player in game_start['data']['players']} == {
            ('player-1', 'Alice'),
            ('player-2', 'Bob'),
        }

    asyncio.run(start_game())

def test_collisions():
    box1 = Box(Vec2(0, 0), Vec2(5, 5))
    box2 = Box(Vec2(0, 0), Vec2(5, 5))

    assert Box.area_colliding(box1, box2)

    box3 = Box(Vec2(100, 0), Vec2(5, 5))
    box4 = Box(Vec2(0, 0), Vec2(5, 5))

    assert not Box.area_colliding(box3, box4)

    box5 = Box(Vec2(0, 0), Vec2(100, 5))
    box6 = Box(Vec2(50, 0), Vec2(10, 10))

    assert Box.area_colliding(box5, box6)

    box7 = Box(Vec2(-50, -50), Vec2(1, 5))
    box8 = Box(Vec2(-45, -50), Vec2(10, 10))

    assert not Box.area_colliding(box7, box8)

def test_state_initializes_players():
    state = State.init_populated(["a", "b", "c"])

    assert len(state.players) == 3


def test_player_movemet():
    state = State()
    player = state.add_player(Player('p1', Vec2(100, 100)))
    player2 = state.add_player(Player('p2', Vec2(100, 100)))

    state.set_player_movement_dir("p1", Vec2(1, 0))

    state.step_frame()

    assert player.pos == Vec2(100, 100) + PLAYER_SPEED * Vec2(1, 0)
    assert player2.pos == Vec2(100, 100)


def test_player_hit():
    state = State()
    player = state.add_player(Player('a', Vec2(100, 100)))

    assert player.hp == 100
    player.hit()
    assert player.hp == 90

def test_shooting_direction():
    player = Player("abc", Vec2(0, 0))
    shooting_dir = player.get_shooting_dir()

    assert shooting_dir.x == pytest.approx(1)
    assert shooting_dir.y == pytest.approx(0)

    player.rotation = math.pi / 2
    shooting_dir = player.get_shooting_dir()

    assert shooting_dir.x == pytest.approx(0)
    assert shooting_dir.y == pytest.approx(1)

    player.rotation = math.pi
    shooting_dir = player.get_shooting_dir()

    assert shooting_dir.x == pytest.approx(-1)
    assert shooting_dir.y == pytest.approx(0)


    player.rotation = 3 * math.pi / 2
    shooting_dir = player.get_shooting_dir()

    assert shooting_dir.x == pytest.approx(0)
    assert shooting_dir.y == pytest.approx(-1)
  
def test_bullet_hits_player():
    state = State()

    shooter = state.add_player(Player('a', Vec2(100, 100)))
    target = state.add_player(Player('b', Vec2(100 + BULLET_SPEED, 100)))

    shooter.rotation = 0

    state.current_frame = SHOOTING_DELAY + 1
    state.try_shoot_player_bullet("a")

    state.step_frame()

    assert target.hp == 90
    assert len(state.bullets) == 0


def test_lethal_bullet_reports_killer():
    state = State()

    shooter = state.add_player(Player('shooter', Vec2(100, 100)))
    target = state.add_player(Player('target', Vec2(100 + BULLET_SPEED, 100)))
    target.hp = 10
    shooter.rotation = 0

    state.current_frame = SHOOTING_DELAY + 1
    state.try_shoot_player_bullet(shooter.uuid)

    changes = state.step_frame().to_dict()

    assert changes['deaths'] == [{
        'player_id': target.uuid,
        'killer_id': shooter.uuid,
    }]


def test_removed_player_without_attacker_reports_unknown_killer():
    state = State()
    player = state.add_player(Player('disconnected-player', Vec2(100, 100)))

    state.kill_player(player.uuid)
    changes = state.step_frame().to_dict()

    assert changes['deaths'] == [{
        'player_id': player.uuid,
        'killer_id': None,
    }]

def test_bullet_delay():
    state = State()
    player = state.add_player(Player('a', Vec2(100, 100)))

    state.current_frame = 100

    player.last_shot_time = 101

    state.try_shoot_player_bullet("a")
    assert len(state.bullets) == 0
    assert player.last_shot_time == 101

def test_collision_with_walls():
    state = State()
    player = state.add_player(Player('a', Vec2(100, 100)))

    level_size = state.get_level_info().level_size

    # left wall
    player.pos = Vec2(PLAYER_SIZE.x // 2, 50)
    player.movement_dir = Vec2(-1, 0)
    state.step_frame()

    assert player.pos == Vec2(PLAYER_SIZE.x // 2, 50)

    # right wall
    player.pos = Vec2(level_size.x - PLAYER_SIZE.x // 2, 50)
    player.movement_dir = Vec2(1, 0)
    state.step_frame()

    assert player.pos == Vec2(level_size.x - PLAYER_SIZE.x // 2, 50)

    # top wall
    player.pos = Vec2(50, PLAYER_SIZE.y // 2)
    player.movement_dir = Vec2(0, -1)
    state.step_frame()

    assert player.pos == Vec2(50, PLAYER_SIZE.y // 2)

    # bottom wall
    player.pos = Vec2(50, level_size.y - PLAYER_SIZE.y // 2)
    player.movement_dir = Vec2(0, 1)
    state.step_frame()

    assert player.pos == Vec2(50, level_size.y - PLAYER_SIZE.y // 2)
