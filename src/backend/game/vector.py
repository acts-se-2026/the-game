import math

class Vec2:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self):
        return f"Vec2{(self.x, self.y)}"

    def __eq__(lhs, rhs):
        return lhs.x == rhs.x and lhs.y == rhs.y
    
    def __add__(lhs, rhs):
        return Vec2(lhs.x + rhs.x, lhs.y + rhs.y)

    def __sub__(lhs, rhs):
        return Vec2(lhs.x - rhs.x, lhs.y - rhs.y)

    def __mul__(self, scalar):
        return Vec2(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar):
        return self * scalar

    def __neg__(self):
        return Vec2(-self.x, -self.y)

    def __truediv__(self, divisor):
        return self * (1 / divisor)

    def sqr_length(self):
        return self.x ** 2 + self.y ** 2

    def length(self):
        return math.sqrt(self.sqr_length())

    def normalized(self):
        return self / self.length()


Vec2.ONE = Vec2(1, 1)
Vec2.ZERO = Vec2(0, 0)
Vec2.LEFT = Vec2(-1, 0)
Vec2.RIGHT = Vec2(1, 0)
Vec2.UP = Vec2(0, -1)
Vec2.DOWN = Vec2(0, 1)
