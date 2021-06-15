import {Component, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {MazeGridComponent} from '../maze-grid/maze-grid.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  @ViewChild('maze') mazeComponent: MazeGridComponent | undefined;
  @ViewChild('fileUpload') fileUpload: any | undefined;

  public fileName = '';
  settings = {
    cellSize: 28,
    solvedPathThickness: 3,
    cellEntranceBackground: '#0000FF',
    cellBackground: '#ffffff',
    cellExitBackground: '#FF0000',
    cellWallBackground: '#000000',
    solvedPathColor: '#00ba00'
  };

  generateSettings = {
    width: 0,
    height: 0,
    randomEntranceAndExit: false
  };

  public typesOfAlgorithms: string[] = ['Depth-first search', 'Breadth-first search'];
  public selectedAlgorithm = '';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private snackBar: MatSnackBar) {
  }

  public updateCellSize(event: any): void {
    this.settings.cellSize = event.value;
  }

  public updateSolvedPathThickness(event: any): void {
    this.settings.solvedPathThickness = event.value;
  }

  public loadMaze(fileName: string): void {
    this.mazeComponent?.loadMazeFromFile(fileName);
    // this.fileName = fileName;
  }

  public solveMaze(method: string): void {
    this.mazeComponent?.solveMaze(method);
  }

  public saveSettings(): void {
    this.mazeComponent?.redrawMaze(true);
  }

  public generateMaze(): void {
    this.mazeComponent?.generateMaze(this.generateSettings.width, this.generateSettings.height,
      this.generateSettings.randomEntranceAndExit);
  }

  public onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      if (file.type === 'application/json'){
        this.fileName = file.name;
        this.mazeComponent?.loadMazeFromFile(file.name, file);

        // allows upload same file twice
        this.fileUpload.nativeElement.value = '';
      } else {
        this.openSnackBar('Wrong file type');
      }
    }
  }

  public downloadMazeFile(): void {
    this.mazeComponent?.createMazeJsonFile();
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close');
  }
}
