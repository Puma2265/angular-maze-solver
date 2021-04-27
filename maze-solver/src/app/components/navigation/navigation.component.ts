import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {MazeGridComponent} from '../maze-grid/maze-grid.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  @ViewChild('maze') mazeComponent: MazeGridComponent | undefined;

  public fileName = '';
  settings = {
    cellSize: 28,
    cellEntranceBackground: '#0000FF',
    cellBackground: '#ffffff',
    cellExitBackground: '#FF0000',
    cellWallBackground: '#000000',
    solvedPathColor: '#00ba00'
  };

  public typesOfAlgorithms: string[] = ['Depth-first search', 'Breadth-first search'];
  public selectedAlgorithm = '';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {
  }

  updatePixelSize(event: any): void {
    this.settings.cellSize = event.value;
  }

  loadMaze(fileName: string): void {
    this.fileName = fileName;
  }

  solveMaze(method: string): void {
    this.mazeComponent?.solveMaze(method);
  }

  saveSettings(): void {
    this.mazeComponent?.redrawMaze(true);
  }
}
