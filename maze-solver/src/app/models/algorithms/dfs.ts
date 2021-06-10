import {Cell} from '../cell';
import {Maze} from '../maze';

export class Dfs {
  private readonly maze: Maze | undefined;

  constructor(maze: Maze) {
    this.maze = maze;
  }

  public solve(): Cell[] {
    const path: Cell[] = [];

    // check if maze has defined entrance and exit
    if (this.maze?.entranceCell && this.maze?.exitCell) {
      // add starting cell
      path.unshift(this.maze.entranceCell);

      while (true) {
        const current = path[0];
        if (current) {
          current.traversed = true;

          if (this.isEqual(current, this.maze.exitCell)) {
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
        } else {
          break;
        }
      }
    } else {
      return path;
    }
    return path.reverse();
  }

  private isEqual(cell1: Cell, cell2: Cell): boolean {
    return cell1.row === cell2.row && cell1.col === cell2.col;
  }
}
