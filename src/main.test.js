import { describe, it, expect } from 'vitest';

// Mock the game logic for testing
function isSnakeCollidingWithWall(snakeHead, canvasWidth, canvasHeight, wallThickness) {
  return (
    snakeHead.x < wallThickness ||
    snakeHead.y < wallThickness ||
    snakeHead.x >= canvasWidth - wallThickness ||
    snakeHead.y >= canvasHeight - wallThickness
  );
}

function isSnakeCollidingWithYellowSnake(snakeHead, yellowSnakeSegments) {
  return yellowSnakeSegments.some(segment => segment.x === snakeHead.x && segment.y === snakeHead.y);
}

function isSnakeCollidingWithBomb(snakeHead, bomb) {
  return bomb && snakeHead.x === bomb.x && snakeHead.y === bomb.y;
}

describe('Snake Wall Collision', () => {
  const canvasWidth = 400;
  const canvasHeight = 400;
  const wallThickness = 20;

  it('should detect collision when snake hits the left wall', () => {
    const snakeHead = { x: 10, y: 50 };
    expect(isSnakeCollidingWithWall(snakeHead, canvasWidth, canvasHeight, wallThickness)).toBe(true);
  });

  it('should detect collision when snake hits the top wall', () => {
    const snakeHead = { x: 50, y: 10 };
    expect(isSnakeCollidingWithWall(snakeHead, canvasWidth, canvasHeight, wallThickness)).toBe(true);
  });

  it('should detect collision when snake hits the right wall', () => {
    const snakeHead = { x: 390, y: 50 };
    expect(isSnakeCollidingWithWall(snakeHead, canvasWidth, canvasHeight, wallThickness)).toBe(true);
  });

  it('should detect collision when snake hits the bottom wall', () => {
    const snakeHead = { x: 50, y: 390 };
    expect(isSnakeCollidingWithWall(snakeHead, canvasWidth, canvasHeight, wallThickness)).toBe(true);
  });

  it('should not detect collision when snake is within bounds', () => {
    const snakeHead = { x: 50, y: 50 };
    expect(isSnakeCollidingWithWall(snakeHead, canvasWidth, canvasHeight, wallThickness)).toBe(false);
  });
});

describe('Snake Yellow Snake Collision', () => {
  it('should detect collision when snake hits the yellow snake', () => {
    const snakeHead = { x: 100, y: 100 };
    const yellowSnakeSegments = [
      { x: 100, y: 100 },
      { x: 80, y: 100 },
      { x: 60, y: 100 }
    ];
    expect(isSnakeCollidingWithYellowSnake(snakeHead, yellowSnakeSegments)).toBe(true);
  });

  it('should not detect collision when snake does not hit the yellow snake', () => {
    const snakeHead = { x: 100, y: 100 };
    const yellowSnakeSegments = [
      { x: 80, y: 100 },
      { x: 60, y: 100 },
      { x: 40, y: 100 }
    ];
    expect(isSnakeCollidingWithYellowSnake(snakeHead, yellowSnakeSegments)).toBe(false);
  });
});

describe('Snake Bomb Collision', () => {
  it('should detect collision when snake hits a bomb', () => {
    const snakeHead = { x: 100, y: 100 };
    const bomb = { x: 100, y: 100 };
    expect(isSnakeCollidingWithBomb(snakeHead, bomb)).toBe(true);
  });

  it('should not detect collision when snake does not hit a bomb', () => {
    const snakeHead = { x: 100, y: 100 };
    const bomb = { x: 80, y: 100 };
    expect(isSnakeCollidingWithBomb(snakeHead, bomb)).toBe(false);
  });
});