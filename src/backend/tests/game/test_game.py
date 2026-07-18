import math

import pytest

from game.state import (
    BULLET_SPEED,
    CANNON_END_RADIUS,
    PLAYER_SIZE,
    PLAYER_SPEED,
    SHOOTING_DELAY,
    Box,
    Player,
    State,
)
from game.vector import Vec2


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
    target = state.add_player(Player('b', Vec2(100 + BULLET_SPEED + CANNON_END_RADIUS, 100)))

    shooter.rotation = 0

    state.current_frame = SHOOTING_DELAY + 1
    state.try_shoot_player_bullet("a")

    state.step_frame()

    assert target.hp == 90
    assert len(state.bullets) == 0

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
