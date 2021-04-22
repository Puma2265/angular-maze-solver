import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Cell } from 'src/app/models/cell';
import { Maze } from 'src/app/models/maze';

@Component({
  selector: 'app-maze-grid',
  templateUrl: './maze-grid.component.html',
  styleUrls: ['./maze-grid.component.scss'],
})
export class MazeGridComponent implements OnInit, AfterViewInit {
  private mazeFile: any;

  private width: number | undefined;
  private height: number | undefined;
  private maze: Maze | undefined;
  private canvas: HTMLCanvasElement | undefined;
  private ctx: CanvasRenderingContext2D | any;
  private cellSize: number = 28;
  private cellEdgeThickness: number = 2;
  private cellBackground: string = '#FFFFFF';
  private cellEntranceBackground: string = '#0000FF';
  private cellExitBackground: string = '#FF0000';
  private cellWallBackground: string = '#000000';
  private solvedPathColor: string = '#00FF00';
  private solvedPathThickness: number = 3;
  private currentCell: Cell | undefined;
  private solvedPath: Cell[] = [];

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.canvas = <HTMLCanvasElement>document.getElementById('maze');
    this.ctx = this.canvas.getContext('2d');
    this.renderMaze();
  }

  renderMaze() {
    this.httpClient.get('assets/mazes/maze.json').subscribe((data) => {
      this.mazeFile = data;
      this.width = this.mazeFile.width;
      this.height = this.mazeFile.height;
      this.maze = new Maze(
        this.mazeFile.width,
        this.mazeFile.height,
        this.mazeFile.board
      );

      this.canvas!.width = this.height! * this.cellSize;
      this.canvas!.height = this.width! * this.cellSize;

      this.ctx.lineWidth = this.cellEdgeThickness;

      this.maze.cells.forEach((x) => x.forEach((c) => this.draw(c)));
      this.maze.solveMaze('DFS');
      this.solvedPath = this.maze.solutionPath;
      console.log(this.solvedPath);
      this.drawSolution(this.solvedPath);
    });
  }

  private draw(cell: Cell) {
    this.setCellBackground(cell);
    this.ctx.fillRect(
      cell.col * this.cellSize,
      cell.row * this.cellSize,
      (cell.col + 1) * this.cellSize,
      (cell.row + 1) * this.cellSize
    );
    this.ctx.beginPath();
    this.ctx.moveTo(cell.col * this.cellSize, cell.row * this.cellSize);
    this.ctx.lineTo((cell.col + 1) * this.cellSize, cell.row * this.cellSize);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo((cell.col + 1) * this.cellSize, cell.row * this.cellSize);
    this.ctx.lineTo(
      (cell.col + 1) * this.cellSize,
      (cell.row + 1) * this.cellSize
    );
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(
      (cell.col + 1) * this.cellSize,
      (cell.row + 1) * this.cellSize
    );
    this.ctx.lineTo(cell.col * this.cellSize, (cell.row + 1) * this.cellSize);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(cell.col * this.cellSize, (cell.row + 1) * this.cellSize);
    this.ctx.lineTo(cell.col * this.cellSize, cell.row * this.cellSize);
    this.ctx.stroke();
  }

  drawSolution(path: Cell[]) {
    this.drawPath(path, true);
  }

  private drawPath(path: Cell[], drawSolution = false) {
    this.ctx.lineWidth = this.solvedPathThickness;
    this.ctx.strokeStyle = this.solvedPathColor;
    this.ctx.beginPath();

    path.forEach((x) =>
      this.ctx.lineTo(
        (x.col + 0.5) * this.cellSize,
        (x.row + 0.5) * this.cellSize
      )
    );
    if (drawSolution) {
      this.ctx.lineTo(
        this.width! * this.cellSize,
        (this.height! - 0.5) * this.cellSize
      );
    }
    this.ctx.stroke();
  }

  private setCellBackground(cell: Cell) {
    if (cell.isWall) {
      this.ctx.fillStyle = this.cellWallBackground;
    } else if (this.maze?.getEntranceCell === cell) {
      this.ctx.fillStyle = this.cellEntranceBackground;
    } else if (this.maze?.getExitCell === cell) {
      this.ctx.fillStyle = this.cellExitBackground;
    } else {
      this.ctx.fillStyle = this.cellBackground;
    }
  }
}
