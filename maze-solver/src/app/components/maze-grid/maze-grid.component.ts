import {HttpClient} from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {Cell} from 'src/app/models/cell';
import {Maze} from 'src/app/models/maze';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-maze-grid',
  templateUrl: './maze-grid.component.html',
  styleUrls: ['./maze-grid.component.scss'],
})
export class MazeGridComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private destroy$ = new Subject();
  private algoWorker: Worker | undefined;

  @Input() fileName = '';
  @Input() settings: any;
  private mazeFile: any;

  public width: number | undefined;
  public height: number | undefined;
  private maze: Maze | undefined;
  private canvas: HTMLCanvasElement | undefined;
  private ctx: CanvasRenderingContext2D | any;
  private cellSize: any;
  private cellEdgeThickness = 1;
  private cellBackground: string | undefined;
  private cellEntranceBackground: string | undefined;
  private cellExitBackground: string | undefined;
  private cellWallBackground: string | undefined;
  private solvedPathColor: string | undefined;
  private solvedPathThickness = 3;
  private solvedPath: Cell[] = [];
  private lastUsedSolvingMethod = '';

  public working = false;
  public progressBarMode: any = 'determinate';

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.setSettings();
    if (typeof Worker !== 'undefined') {
      this.algoWorker = new Worker('../../workers/algo-worker.worker', {type: `module`});
    } else {
      throw new Error('Web Worker is not enabled');
    }
  }

  ngAfterViewInit(): void {
    this.canvas = (document.getElementById('maze') as HTMLCanvasElement);
    this.ctx = this.canvas.getContext('2d');
  }

  ngOnChanges(): void {
    if (this.fileName !== '') {
      this.drawMaze(this.fileName);
      this.solvedPath = [];
      this.lastUsedSolvingMethod = '';
    }
  }

  drawMaze(fileName: string): void {
    this.changeProgressBarStatus();

    this.httpClient
      .get('assets/mazes/' + fileName + '.json')
      .pipe(takeUntil(this.destroy$))
      .pipe(finalize(() => {
        this.changeProgressBarStatus();
      }))
      .subscribe((data) => {
        this.mazeFile = data;
        this.width = this.mazeFile.width;
        this.height = this.mazeFile.height;
        this.maze = new Maze(
          this.mazeFile.width,
          this.mazeFile.height,
          this.mazeFile.board
        );

        this.canvas!.width = this.height! * this.cellSize!;
        this.canvas!.height = this.width! * this.cellSize!;

        this.ctx.lineWidth = this.cellEdgeThickness;
        this.maze.cells.forEach((x) => x.forEach((c) => this.draw(c)));
      });
  }

  public redrawMaze(drawSolution?: boolean): void {
    this.changeProgressBarStatus();
    if (this.maze) {
      this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
      this.setSettings();
      this.canvas!.width = this.height! * this.cellSize!;
      this.canvas!.height = this.width! * this.cellSize!;

      this.ctx.lineWidth = this.cellEdgeThickness;
      this.maze.cells.forEach((x) => x.forEach((c) => this.draw(c)));
      if (drawSolution && this.solvedPath.length > 0) {
        this.drawSolution(this.solvedPath);
      }
    }
    this.changeProgressBarStatus();
  }

  public solveMaze(method: string): void {
    this.changeProgressBarStatus();
    if (this.maze) {
      this.redrawMaze(false);
      // this.maze.solveMaze(method);
      if (this.algoWorker) {
        this.algoWorker.postMessage({method, maze: this.maze});
        this.algoWorker.onmessage = ({data}) => {
          if (this.maze) {
            this.maze.solutionPath = data;
            this.solvedPath = this.maze.solutionPath;
            this.drawSolution(this.solvedPath);
            this.lastUsedSolvingMethod = method;
          }
        };
      }
    } else {
      this.openSnackBar('Select maze to solve');
    }
    this.changeProgressBarStatus();
  }

  private draw(cell: Cell): void {
    this.setCellBackground(cell);
    this.ctx.fillRect(
      cell.col * this.cellSize,
      cell.row * this.cellSize,
      (cell.col + 1) * this.cellSize,
      (cell.row + 1) * this.cellSize
    );
    this.ctx.beginPath();
    this.ctx.stroke();
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

  private drawSolution(path: Cell[]): void {
    if (path.length > 0) {
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
    } else {
      this.openSnackBar('Path not found for this maze');
    }
  }

  private setCellBackground(cell: Cell): void {
    if (cell.isWall) {
      this.ctx.fillStyle = this.cellWallBackground;
    } else if (this.maze?.entranceCell === cell) {
      this.ctx.fillStyle = this.cellEntranceBackground;
    } else if (this.maze?.exitCell === cell) {
      this.ctx.fillStyle = this.cellExitBackground;
    } else {
      this.ctx.fillStyle = this.cellBackground;
    }
  }

  private setSettings(): void {
    this.cellBackground = this.settings.cellBackground;
    this.cellEntranceBackground = this.settings.cellEntranceBackground;
    this.cellExitBackground = this.settings.cellExitBackground;
    this.cellWallBackground = this.settings.cellWallBackground;
    this.solvedPathColor = this.settings.solvedPathColor;
    this.cellSize = this.settings.cellSize;
  }

  private changeProgressBarStatus(): void {
    if (this.progressBarMode === 'indeterminate') {
      this.working = false;
      setTimeout(() => {
        this.progressBarMode = 'determinate';
      }, 250);
    } else {
      this.working = true;
      this.progressBarMode = 'indeterminate';
    }
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.algoWorker?.terminate();
  }
}
