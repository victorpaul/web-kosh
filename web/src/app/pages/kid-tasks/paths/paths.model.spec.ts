import { MAX_STEPS, MIN_STEPS, PathPuzzle, Point, makePuzzle, pathPoints, placeItems, placeObstacles } from './paths.model';

const key = (p: Point) => `${p.x},${p.y}`;

function everyPuzzle(run: (puzzle: PathPuzzle, steps: number) => void): void {
  for (let steps = MIN_STEPS; steps <= MAX_STEPS; steps++) {
    for (let i = 0; i < 100; i++) run(makePuzzle(steps), steps);
  }
}

describe('pathPoints', () => {
  it('walks from start to end one grid point at a time', () => {
    everyPuzzle((puzzle) => {
      const points = pathPoints(puzzle);
      expect(points[0]).toEqual(puzzle.start);
      expect(points[points.length - 1]).toEqual(puzzle.end);
      expect(points.length).toBe(puzzle.steps.reduce((sum, step) => sum + step.len, 0) + 1);
    });
  });
});

describe('placeItems', () => {
  it('puts every item on the path, never on the start or the end', () => {
    everyPuzzle((puzzle) => {
      const inner = new Set(pathPoints(puzzle).slice(1, -1).map(key));
      for (const item of placeItems(puzzle, 6)) expect(inner.has(key(item))).toBeTrue();
    });
  });

  it('never puts two items on the same point', () => {
    everyPuzzle((puzzle) => {
      const items = placeItems(puzzle, 6);
      expect(new Set(items.map(key)).size).toBe(items.length);
    });
  });

  it('places as many as asked, or as many as the path has room for', () => {
    everyPuzzle((puzzle) => {
      const room = pathPoints(puzzle).length - 2;
      expect(placeItems(puzzle, 3).length).toBe(Math.min(3, room));
      expect(placeItems(puzzle, 0)).toEqual([]);
    });
  });

  it('has both coins and meat whenever there are two items or more', () => {
    everyPuzzle((puzzle) => {
      const items = placeItems(puzzle, 2);
      if (items.length === 2) expect(new Set(items.map((item) => item.kind)).size).toBe(2);
    });
  });

  it('uses only coins and meat', () => {
    everyPuzzle((puzzle) => {
      for (const item of placeItems(puzzle, 6)) expect(['coin', 'meat']).toContain(item.kind);
    });
  });
});

describe('placeObstacles', () => {
  const cornersOf = (square: Point) => [square, { x: square.x + 1, y: square.y }, { x: square.x, y: square.y + 1 }, { x: square.x + 1, y: square.y + 1 }];

  it('uses only squares that share not even a corner with the path', () => {
    everyPuzzle((puzzle) => {
      const path = new Set(pathPoints(puzzle).map(key));
      for (const square of placeObstacles(puzzle, 8)) expect(cornersOf(square).some((c) => path.has(key(c)))).toBeFalse();
    });
  });

  it('leaves the squares already taken free, so enemies never stand on a stone', () => {
    everyPuzzle((puzzle) => {
      const stones = placeObstacles(puzzle, 6);
      const enemies = placeObstacles(puzzle, 6, stones);
      const taken = new Set(stones.map(key));
      for (const enemy of enemies) expect(taken.has(key(enemy))).toBeFalse();
      expect(new Set(enemies.map(key)).size).toBe(enemies.length);
    });
  });
});
