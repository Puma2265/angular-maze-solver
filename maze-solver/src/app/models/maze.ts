import {Dfs} from './algorithms/dfs';
import {Cell} from './cell';
import {Bfs} from './algorithms/bfs';

export class Maze {
  public readonly cells: Cell[][] = [];
  public solutionPath: Array<Cell> = [];
  public readonly entranceCell: Cell | undefined;
  public readonly exitCell: Cell | undefined;

  constructor(public width: number, public height: number, board: any) {
    for (let i = 0; i < width; i++) {
      this.cells[i] = [];
      for (let j = 0; j < height; j++) {
        this.cells[i][j] = new Cell(i, j, board[i][j]);
        if (board[i][j] === 2) {
          this.entranceCell = this.cells[i][j];
        } else if (board[i][j] === 3) {
          this.exitCell = this.cells[i][j];
        }
      }
    }
    this.cells.forEach((row) => row.forEach((c) => this.mapNeighbors(c)));
  }

  // Check if a cell is inside the bounds of the maze
  public inBounds(row: number, col: number): boolean {
    return col >= 0 && col < this.width && row >= 0 && row < this.height;
  }

  private mapNeighbors(cell: Cell): void {
    if (cell.row - 1 >= 0) {
      cell.neighbors.push(this.cells[cell.row - 1][cell.col]);
    }
    if (cell.row + 1 < this.width) {
      cell.neighbors.push(this.cells[cell.row + 1][cell.col]);
    }
    if (cell.col - 1 >= 0) {
      cell.neighbors.push(this.cells[cell.row][cell.col - 1]);
    }
    if (cell.col + 1 < this.height) {
      cell.neighbors.push(this.cells[cell.row][cell.col + 1]);
    }
  }

  public solveMaze(method: string): void {
    this.cells.forEach((x) => x.forEach((c) => (c.traversed = false)));
    if (method === 'Depth-first search') {
      this.solutionPath = new Dfs(this).solve();
    }
    if (method === 'Breadth-first search') {
      this.solutionPath = new Bfs(this).solve();
    }
  }
}
