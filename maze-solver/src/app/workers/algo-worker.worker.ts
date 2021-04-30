/// <reference lib="webworker" />

import {Maze} from '../models/maze';
import {Dfs} from '../models/algorithms/dfs';
import {Bfs} from '../models/algorithms/bfs';
import {Cell} from '../models/cell';


function solveMaze(method: string, maze: Maze): Array<Cell> {
  let solutionPath: Array<Cell> = [];
  maze.cells.forEach((x) => x.forEach((c) => (c.traversed = false)));

  if (maze) {
    if (method === 'Depth-first search') {
      solutionPath = new Dfs(maze).solve();
    }
    if (method === 'Breadth-first search') {
      solutionPath = new Bfs(maze).solve();
    }
  }
  return solutionPath;
}

self.addEventListener('message', (messageEvent: MessageEvent) => {
  const method = messageEvent.data.method;
  const maze = messageEvent.data.maze;

  postMessage(solveMaze(method, maze));
});
