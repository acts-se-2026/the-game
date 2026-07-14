from game.state import Player, Box, State
from game.vector import Vec2

def test_collisions():
    box1 = Box(Vec2(0, 0), Vec2(5, 5))
    box2 = Box(Vec2(0, 0), Vec2(5, 5))

    assert Box.area_colliding(box1, box2) == True

    box3 = Box(Vec2(100, 0), Vec2(5, 5))
    box4 = Box(Vec2(0, 0), Vec2(5, 5))

    assert Box.area_colliding(box3, box4) == False

    box5 = Box(Vec2(0, 0), Vec2(100, 5))
    box6 = Box(Vec2(50, 0), Vec2(10, 10))

    assert Box.area_colliding(box5, box6) == True

    box7 = Box(Vec2(-50, -50), Vec2(1, 5))
    box8 = Box(Vec2(-45, -50), Vec2(10, 10))

    assert Box.area_colliding(box7, box8) == False


def test_player_movemet():
    state = State(["p1", "p2"])
    state.set_player_movement_dir("p1", Vec2(1, 0))

    state.step_frame()

    player = state.players[0]
    player2 = state.players[1]

    assert player.pos == Vec2(100, 100) + player.speed * Vec2(1, 0)
    assert player2.pos == Vec2(100, 100)


def test_player_hit():
    state = State(["p1"])

    player = state.players[0]

    assert player.hp == 100
    player.hit()
    assert player.hp == 90

def test_player_hit():
    state = State(["p1"])

    player = state.players[0]

    assert player.hp == 100
    player.hit()
    assert player.hp == 90




