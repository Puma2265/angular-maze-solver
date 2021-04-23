import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cell } from 'src/app/models/cell';
import { Maze } from 'src/app/models/maze';

@Component({
  selector: 'app-maze-grid',
  templateUrl: './maze-grid.component.html',
  styleUrls: ['./maze-grid.component.scss'],
})
export class MazeGridComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private destroy$ = new Subject();

  @Input() fileName: string = '';
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
  private solvedPath: Cell[] = [];

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.canvas = <HTMLCanvasElement>document.getElementById('maze');
    this.ctx = this.canvas.getContext('2d');
  }

  ngOnChanges(): void {
    if (this.fileName !== '') {
      this.renderMaze(this.fileName);
    }
  }

  renderMaze(fileName: string) {
    this.httpClient
      .get('assets/mazes/' + fileName + '.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
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
    this.drawPath(path);
  }

  private drawPath(path: Cell[]) {
    this.ctx.lineWidth = this.solvedPathThickness;
    this.ctx.strokeStyle = this.solvedPathColor;
    this.ctx.beginPath();

    path.forEach((x) =>
      this.ctx.lineTo(
        (x.col + 0.5) * this.cellSize,
        (x.row + 0.5) * this.cellSize
      )
    );
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
