import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit,} from '@angular/core';
import {Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {Cell} from 'src/app/models/cell';
import {Maze} from 'src/app/models/maze';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PrimsGenerator} from '../../models/algorithms/primsGenerator';
import {saveAs} from 'file-saver-es';

@Component({
  selector: 'app-maze-grid',
  templateUrl: './maze-grid.component.html',
  styleUrls: ['./maze-grid.component.scss'],
})
export class MazeGridComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() fileName = '';
  @Input() settings: any;
  public width: number | undefined;
  public height: number | undefined;
  public working = false;
  public progressBarMode: any = 'determinate';
  private destroy$ = new Subject();
  private mazeFile: any;
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
  private solvedPathThickness: number | undefined;
  private solvedPath: Cell[] = [];
  private lastUsedSolvingMethod = '';

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.setSettings();
  }

  ngAfterViewInit(): void {
    this.canvas = (document.getElementById('maze') as HTMLCanvasElement);
    this.ctx = this.canvas.getContext('2d');
  }

  ngOnChanges(): void {
  }

  // draws maze from JSON file
  public loadMazeFromFile(fileName: string, uploadedFile?: File): void {
    this.changeProgressBarStatus();
    this.solvedPath = [];
    this.lastUsedSolvingMethod = '';

    if (!uploadedFile) {
      this.httpClient
        .get('assets/mazes/' + fileName)
        .pipe(takeUntil(this.destroy$))
        .pipe(finalize(() => {
          this.changeProgressBarStatus();
        }))
        .subscribe((data) => {
          this.drawMazeFromFileData(data);
        });
    } else {
      const fileReader = new FileReader();
      fileReader.readAsText(uploadedFile, 'UTF-8');
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') {
          this.drawMazeFromFileData(JSON.parse(fileReader.result));
        }
      };
      fileReader.onerror = (error) => {
        this.openSnackBar('Problem with loading maze from file');
      };
    }
    this.changeProgressBarStatus();
  }

  public generateMaze(width: number, height: number, randomEntranceAndExit: boolean): void {
    this.changeProgressBarStatus();
    this.width = width;
    this.height = height;
    this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    this.maze = new PrimsGenerator(width, height, randomEntranceAndExit).generate();
    this.redrawMaze();
    this.changeProgressBarStatus();
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
    } else {
      this.openSnackBar('Problem with getting maze object');
    }
    this.changeProgressBarStatus();
  }

  public openInNewTab(): void {
    if (this.maze && this.canvas) {
      const w = window.open('about:blank');
      if (w) {
        const img = new Image();
        img.src = this.canvas.toDataURL('image/png');
        setTimeout(() => {
          w.document.write(img.outerHTML);
        }, 0);
      }
    }
  }

  public solveMaze(method: string): void {
    this.changeProgressBarStatus();
    if (this.maze) {
      this.maze.cells.forEach((x) => x.forEach((c) => (c.traversed = false)));
      this.redrawMaze(false);
      this.maze.solveMaze(method);
      this.solvedPath = this.maze.solutionPath;
      this.drawSolution(this.solvedPath);
      this.lastUsedSolvingMethod = method;

    } else {
      this.openSnackBar('Select maze to solve');
    }
    this.changeProgressBarStatus();
  }

  public createMazeJsonFile(): void {
    if (this.maze) {
      const boardArray: number[][] = [];
      for (let i = 0; i < this.maze.width; i++) {
        boardArray[i] = [];
        for (let j = 0; j < this.maze.height; j++) {
          boardArray[i][j] = this.maze.cells[i][j].value;
        }
      }

      const mazeFile = {
        width: this.maze.width,
        height: this.maze.height,
        board: boardArray
      };

      const file = new File([JSON.stringify(mazeFile)], 'maze.json', {type: 'application/JSON'});
      saveAs(file);
    } else {
      this.openSnackBar('Problem with getting maze object.');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.solvedPathThickness = this.settings.solvedPathThickness;
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

  private drawMazeFromFileData(data: any): void {
    this.mazeFile = data;
    if (!this.mazeFile.width || !this.mazeFile.height || !this.mazeFile.board) {
      this.openSnackBar('Wrong JSON data');
    } else if (!Number(this.mazeFile.width) || !Number(this.mazeFile.height)) {
      this.openSnackBar('Wrong JSON data');
    } else {
      this.width = this.mazeFile.width;
      this.height = this.mazeFile.height;
      this.maze = new Maze(
        this.mazeFile.width,
        this.mazeFile.height,
        false,
        this.mazeFile.board
      );

      this.canvas!.width = this.height! * this.cellSize!;
      this.canvas!.height = this.width! * this.cellSize!;

      this.ctx.lineWidth = this.cellEdgeThickness;
      this.maze.cells.forEach((x) => x.forEach((c) => this.draw(c)));
    }
  }
}
