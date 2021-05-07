import {Cell} from '../cell';
import {Maze} from '../maze';

export class Bfs {
  private readonly maze: Maze | undefined;

  constructor(maze: Maze) {
    this.maze = maze;
    console.log(this.maze);
  }

  public solve(): Cell[] {
    const queue: Cell[] = [];
    const path: Cell[] = [];

    if (this.maze && this.maze.entranceCell && this.maze.exitCell) {
      // add starting node
      let current = this.maze.entranceCell;
      current.parent = null;
      current.traversed = true;
      queue.push(current);

      while (queue.length > 0 && !this.isEqual(current, this.maze.exitCell)) {
        current = queue.shift() as Cell;
        const traversableNeighbors = current.neighbors
          .filter((c) => !c.isWall)
          .filter((c) => !c.traversed);

        traversableNeighbors.forEach(c => {
          c.traversed = true;
          c.parent = current;
          queue.push(c);
        });
      }

      // create path
      if (!this.isEqual(current, this.maze.exitCell)) {
        return path;
      } else {
        path.unshift(current);
        while (!this.isEqual(current, this.maze.entranceCell)) {
          current = current.parent;
          path.unshift(current);
        }
      }
    } else {
      throw new Error('Encountered a problem while solving maze');
    }
    return path;
  }

  private isEqual(cell1: Cell, cell2: Cell): boolean {
    return cell1.row === cell2.row && cell1.col === cell2.col;
  }
}

