# Maze solver & generator
### Maze solver & generator made in Angular v11 framework.

[![License](https://camo.githubusercontent.com/1d6258a322e8ebec93c2ee26a9f8c5d2c6d34c2e257e82ae6f9fa338be5b9acb/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f6c2f40616e67756c61722f636c692e737667)](/Puma2265/angular-maze-solver/blob/master/LICENSE)

## Current features
- Loading & uploading maze from file,
- Generating maze using Prim's algorithm,
- Solving maze with DFS & BFS algorithms,
- Drawing maze representation on canvas,
- Settings for canvas drawing,
- Left click on canvas to open it in new window.

## Installation
1. Clone this repo to your local computer.
2. Make sure that you have Node 12.14 or 14.0 installed. See instructions [here](https://nodejs.org/en/download/ "NodeJS").
3. Open your CMD and move to "maze-solver" subfolder inside cloned repo.
4. Type npm install.
5. After it's done type ng serve.
6. By default app will be served on http://localhost:4200/

## Examples
#### An example of a JSON maze file
```json
{
  "width": 8,
  "height": 8,
  "board": [
    [2, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 1, 1, 0, 1],
    [0, 1, 1, 1, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 3]
  ]
}
```
| Board value  | Meaning |
| ------------- | ------------- |
| 0  | passage cell  |
| 1  | wall cell  |
| 2  | entrance cell  |
| 3  | exit cell  |

#### UI
![Example29x29Maze](https://user-images.githubusercontent.com/57237874/121540578-e1b0b180-ca06-11eb-8500-f8307d690735.png)

#### An example of a generated maze with 989 width and 987 height
![Example989x987Maze](https://user-images.githubusercontent.com/57237874/121542405-69e38680-ca08-11eb-821b-394f7865e6e7.png)
