export class Cell {
  neighbors: Cell[] = [];
  isWall = false;
  parent: any;

  // a flag used to indicate if the cell has been traversed or not when finding a maze path
  traversed = false;

  constructor(
    public readonly row: number = 0,
    public readonly col: number = 0,
    public readonly value: number = -1
  ) {
    if (value === 1) {
      this.isWall = true;
    }
  }

  equals(another: Cell): boolean {
    return this.row === another.row && this.col === another.col;
  }
}
