import math

import pytest

from game.state import (
    CANNON_END_RADIUS,
    SHOOTING_DELAY,
    Box,
    Bullet,
    Player,
    State,
)
from game.vector import Vec2


def test_box_touching_edges_do_not_collide():
    # boxes sharing only an edge should not be considered colliding
    box1 = Box(Vec2(0, 0), Vec2(5, 5))
    box2 = Box(Vec2(5, 0), Vec2(5, 5))

    assert not Box.area_colliding(box1, box2)


def test_player_defaults():
    player = Player("p1", Vec2(10, 20))

    assert player.hp == 100
    assert player.rotation == 0
    assert player.last_shot_time == 0
    assert player.movement_dir == Vec2(0, 0)
    assert player.pos == Vec2(10, 20)


def test_player_to_dict():
    player = Player("p1", Vec2(10, 20))
    player.rotation = 1.5

    assert player.to_dict() == {
        "id": "p1",
        "x": 10,
        "y": 20,
        "heading": 1.5,
        "hp": 100,
    }


def test_bullet_to_dict_heading():
    bullet = Bullet(Vec2(0, 0), Vec2(0, 1), "owner")

    result = bullet.to_dict()
    assert result["x"] == 0
    assert result["y"] == 0
    assert result["heading"] == pytest.approx(math.pi / 2)


def test_bullet_ids_are_unique():
    first = Bullet(Vec2(0, 0), Vec2(1, 0), "a")
    second = Bullet(Vec2(0, 0), Vec2(1, 0), "a")

    assert second.id == first.id + 1


def test_set_player_rotation():
    state = State()
    player = state.add_player(Player("p1", Vec2(0, 0)))

    state.set_player_rotation("p1", math.pi)

    assert player.rotation == pytest.approx(math.pi)


def test_kill_player_removed_on_next_frame():
    state = State()
    state.add_player(Player("a", Vec2(100, 100)))
    state.add_player(Player("b", Vec2(300, 300)))

    state.kill_player("a")
    state.step_frame()

    remaining = [player.uuid for player in state.players]
    assert remaining == ["b"]


def test_get_level_info_contains_obstacles():
    obstacles = [Box(Vec2(0, 0), Vec2(10, 10))]
    state = State(obstacles)

    info = state.get_level_info()

    assert info.obstacles is obstacles
    assert info.level_size.x == 1280
    assert info.level_size.y == 720


def test_try_shoot_creates_a_bullet_after_delay():
    state = State()
    shooter = state.add_player(Player("a", Vec2(100, 100)))
    shooter.rotation = 0

    state.current_frame = SHOOTING_DELAY + 1
    state.try_shoot_player_bullet("a")

    assert len(state.bullets) == 1
    bullet = state.bullets[0]
    assert bullet.owner_uuid == "a"
    assert bullet.pos == Vec2(100 + CANNON_END_RADIUS, 100)
