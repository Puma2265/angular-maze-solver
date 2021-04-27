import {Cell} from '../cell';
import {Maze} from '../maze';

export class Bfs {
  private maze: Maze | undefined;

  constructor(maze: Maze) {
    this.maze = maze;
  }

  public solve(): Cell[] {
    const queue: Cell[] = [];
    const path: Cell[] = [];

    // check if maze has defined entrance and exit
    if (this.maze?.getEntranceCell && this.maze?.getExitCell) {
      // add starting cell
      this.maze.getEntranceCell.traversed = true;
      let current: Cell = this.maze.getEntranceCell;
      current.parent = null;

      while (!current.equals(this.maze.getExitCell)) {
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
      while (!current.equals(this.maze.getEntranceCell)) {
        current = current.parent;
        path.unshift(current);
      }
    } else {
      return path;
    }
    return path;
  }
}

