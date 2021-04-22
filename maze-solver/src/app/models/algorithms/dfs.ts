import { Cell } from '../cell';
import { Maze } from '../maze';

export class Dfs {
  private maze: Maze | undefined;

  constructor(_maze: Maze) {
    this.maze = _maze;
  }

  public solve(): Cell[] {
    const path: Cell[] = [];

    // check if maze has defined entrance and exit
    if (this.maze?.getEntranceCell && this.maze?.getExitCell) {
      // add starting cell
      path.unshift(this.maze.getEntranceCell);

      while (true) {
        let current = path[0];
        current.traversed = true;

        if (current.equals(this.maze?.getExitCell)) {
          break;
        }

        const traversableNeighbors = current.neighbors
          .filter((c) => !c.isWall)
          .filter((c) => !c.traversed);

        if (traversableNeighbors.length) {
          path.unshift(traversableNeighbors[0]);
        } else {
          path.splice(0, 1);
        }
      }
    } else {
      return path;
    }

    return path.reverse();
  }
}
