import {Maze} from '../maze';
import {Cell} from '../cell';

export class PrimsGenerator {
  private readonly maze: Maze | undefined;
  private startingCell: Cell | undefined;
  private exitCell: Cell | undefined;
  private readonly directions = [ // distance of 2 to each side
    [0, -2],  // north
    [0, 2],   // south
    [2, 0],   // east
    [-2, 0]   // west
  ];

  constructor(private width: number, private height: number, private randomEntranceAndExit: boolean) {
    this.maze = new Maze(width, height, true);
    this.setStartingCell();
  }

  public generate(): Maze {
    if (this.maze && this.startingCell) {
      let frontierCells: Cell[] = new Array(...this.frontierCellsOf(this.maze.cells[this.startingCell.row][this.startingCell.col]));
      while (frontierCells.length > 0) {
        // get random cell and its neighbours
        const frontierCell = frontierCells[this.randomNumber(frontierCells.length)];
        const frontierNeighbors = this.passageCellsOf(frontierCell);

        if (frontierNeighbors.length > 0) {
          // pick random neighbor
          const neighbor = frontierNeighbors[this.randomNumber(frontierNeighbors.length)];
          this.connect(frontierCell, neighbor);
        }
        // Compute the frontier cells of the chosen frontier cell and add them to the frontier collection
        frontierCells = [...frontierCells, ...this.frontierCellsOf(frontierCell)];
        // remove frontier cell from collection
        frontierCells = frontierCells.filter(c => c !== frontierCell);
      }
      this.setExitCell();
    } else {
      throw new Error('Encountered a problem while generating the maze');
    }
    return this.maze as Maze;
  }

  private get randomCell(): Cell {
    return this.maze?.cells[this.randomNumber(this.width)][this.randomNumber(this.height)] as Cell;
  }

  // get wall cells in a distance of 2
  private frontierCellsOf(cell: Cell): Cell[] {
    return this.cellsAround(cell, true);
  }

  // get cells without walls in a distance of 2
  private passageCellsOf(cell: Cell): Cell[] {
    return this.cellsAround(cell, false);
  }

  private cellsAround(cell: Cell, isWall: boolean): Cell[] {
    const frontier = Array<Cell>();

    this.directions.forEach(d => {
      const newRow = cell.row + d[0];
      const newCol = cell.col + d[1];

      if (this.isValidPosition(newRow, newCol) && this.maze!.cells[newRow][newCol].isWall === isWall) {
        frontier.push(this.maze!.cells[newRow][newCol]);
      }
    });
    return frontier;
  }

  // connect cells which are distance 2 apart
  private connect(cell: Cell, neighbour: Cell): void {
    if (this.maze) {
      const inBetweenRow = (neighbour.row + cell.row) / 2;
      const inBetweenCol = (neighbour.col + cell.col) / 2;
      cell.setPassage();
      this.maze.cells[inBetweenRow][inBetweenCol].setPassage();
      neighbour.setPassage();
    } else {
      throw new Error('Encountered a problem while trying to connect cells');
    }
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.maze!.cells.length && col >= 0 && col < this.maze!.cells[0].length;
  }

  private randomShuffle(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private randomNumber(n: number): number {
    return Math.floor(Math.random() * n);
  }

  private setStartingCell(): void {
    if (this.maze) {
      if (this.randomEntranceAndExit) {
        this.startingCell = this.randomCell;
        this.startingCell.setPassage();
        this.startingCell.value = 2;
        this.maze.entranceCell = this.startingCell;
      } else {
        this.startingCell = this.maze.cells[0][0];
        this.startingCell.setPassage();
        this.startingCell.value = 2;
        this.maze.entranceCell = this.startingCell;
      }
    } else {
      throw new Error('Encountered a problem while generating starting cell');
    }
  }

  // set exit at random passage
  private setExitCell(): void {
    if (this.maze && this.startingCell) {
      if (this.randomEntranceAndExit) {
        let temp = this.randomCell;
        while (temp.isWall && !temp.equals(this.startingCell)) {
          temp = this.randomCell;
        }

        this.exitCell = temp;
        this.exitCell.setPassage();
        this.exitCell.value = 3;
        this.maze.exitCell = this.exitCell;
      } else {
        this.exitCell = this.maze.cells[this.width - 1][this.height - 1];
        this.exitCell.setPassage();
        this.exitCell.value = 3;
        this.maze.exitCell = this.exitCell;
      }
    } else {
      throw new Error('Encountered a problem while generating exit cell');
    }
  }
}
