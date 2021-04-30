import {Cell} from '../cell';
import {Maze} from '../maze';

export class Bfs {
  private readonly maze: Maze | undefined;

  constructor(maze: Maze) {
    this.maze = maze;
  }

  public solve(): Cell[] {
    const queue: Cell[] = [];
    const path: Cell[] = [];

    // check if maze has defined entrance and exit
    if (this.maze?.entranceCell && this.maze?.exitCell) {
      // add starting cell
      this.maze.entranceCell.traversed = true;
      let current: Cell = this.maze.entranceCell;
      current.parent = null;

      while (!this.isEqual(current, this.maze.exitCell)) {
        const traversableNeighbors = current.neighbors
          .filter((c) => !c.isWall)
          .filter((c) => !c.traversed);

        traversableNeighbors.forEach(c => {
          c.traversed = true;
          c.parent = current;
          queue.push(c);
        });
        current = queue.shift() as Cell; // go to next cell
      }

      // create path
      path.unshift(current);

      while (!this.isEqual(current, this.maze.entranceCell)) {
        current = current.parent;
        path.unshift(current);
      }
    } else {
      return path;
    }
    return path;
  }

  private isEqual(cell1: Cell, cell2: Cell): boolean {
    return cell1.row === cell2.row && cell1.col === cell2.col;
  }
}

