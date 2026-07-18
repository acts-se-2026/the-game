import math
import pytest
from game.vector import Vec2


def test_equality_and_repr():
    assert Vec2(1, 2) == Vec2(1, 2)
    assert Vec2(1, 2) != Vec2(2, 1)


def test_add_and_sub():
    assert Vec2(1, 2) + Vec2(3, 4) == Vec2(4, 6)
    assert Vec2(3, 4) - Vec2(1, 2) == Vec2(2, 2)


def test_scalar_mul_and_div():
    assert Vec2(1, 2) * 3 == Vec2(3, 6)
    assert 3 * Vec2(1, 2) == Vec2(3, 6)
    assert Vec2(4, 8) / 2 == Vec2(2, 4)


def test_neg():
    assert -Vec2(1, -2) == Vec2(-1, 2)


def test_floordiv():
    assert Vec2(7, 9) // 2 == Vec2(3, 4)


def test_lengths():
    assert Vec2(3, 4).sqr_length() == 25
    assert Vec2(3, 4).length() == pytest.approx(5)


def test_normalized():
    normalized = Vec2(3, 4).normalized()
    assert normalized.length() == pytest.approx(1)
    assert normalized.x == pytest.approx(0.6)
    assert normalized.y == pytest.approx(0.8)


def test_normalized_or_zero():
    assert Vec2(0, 0).normalized_or_zero() == Vec2.ZERO
    assert Vec2(0, 5).normalized_or_zero() == Vec2(0, 1)


def test_rounded_and_is_int():
    assert Vec2(1.4, 2.6).rounded() == Vec2(1, 3)
    assert Vec2(1, 2).is_int()
    assert not Vec2(1.0, 2).is_int()


def test_to_dict():
    assert Vec2(1, 2).to_dict() == {"x": 1, "y": 2}


def test_constants():
    assert Vec2.ONE == Vec2(1, 1)
    assert Vec2.ZERO == Vec2(0, 0)
    assert Vec2.LEFT == Vec2(-1, 0)
    assert Vec2.RIGHT == Vec2(1, 0)
    assert Vec2.UP == Vec2(0, -1)
    assert Vec2.DOWN == Vec2(0, 1)
