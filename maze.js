//Angela Pellillo, Maze Generator code for the Flare's technical challenge. 

let maze = document.querySelector(".maze");
let ctx = maze.getContext("2d");

let current; //will hold current cell visited

//This class will be the blue print from which the maze will be instantiated
class Maze {
    constructor(size, rows, columns) {
        this.size = size;
        this.rows = rows;
        this.columns = columns;
        this.grid = []; //this array will hold all cells
        this.stack = []; //array to keep track of visited cells
    }

    setup() {
        for (let r = 0; r < this.rows; r++) {
            let row = []; //current row
            for (let c = 0; c < this.columns; c++) {
                let cell = new Cell(r, c, this.grid, this.size);
                row.push(cell);
            }
            this.grid.push(row);
        }
        current = this.grid[0][0]; //starting point, top-left corner

    }

    highlightStartAndEnd() {
        //To highlight start point
        this.grid[0][0].highlightSpecific("red");

        //To highlight exit
        this.grid[this.rows - 1][this.columns - 1].highlightSpecific("green");
    }

    //method to draw the maze
    draw() {
        maze.width = this.size;
        maze.height = this.size;
        maze.style.background = "white";
        current.visited = true;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                let grid = this.grid;
                grid[r][c].show(this.size, this.rows, this.columns);
            }
        }

        let next = current.checkNeighbours();

        if (next) {
            next.visited = true;
            this.stack.push(current);

            current.highlight(this.columns);

            current.removeWall(current, next);

            current = next;
        } else if (this.stack.length > 0) { //if neighbour is not available, we pop a cell from the stack
            let cell = this.stack.pop();
            current = cell;
            current.highlight(this.columns);
        }

        if (this.stack.length == 0) { //all nodes have been searched
            this.highlightStartAndEnd();
            return;
        }

        //calls the drwa function all over again, creates a loop for the animation
        window.requestAnimationFrame(() => {
            this.draw();

        })
    }

}

//Class for the individual cell in the maze
class Cell {
    constructor(rowNum, colNum, parentGrid, parentSize) {
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.parentGrid = parentGrid;
        this.parentSize = parentSize;
        this.visited = false; //this ensures that the maze dows not revisit cells and gets stuck in a lopp
        this.walls = {
            topWall: true,
            righWall: true,
            bottomWall: true,
            leftWall: true,
        };
    }

    //function to check the cell's neighbours
    checkNeighbours() {
        let grid = this.parentGrid;
        let row = this.rowNum;
        let col = this.colNum;
        let neighbours = [];

        let top = row !== 0 ? grid[row - 1][col] : undefined;
        let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
        let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
        let left = col !== 0 ? grid[row][col - 1] : undefined;

        //checking for existing neighbours. If they aren't visited, then they are added to the neighbours array
        if (top && !top.visited) neighbours.push(top);
        if (right && !right.visited) neighbours.push(right);
        if (bottom && !bottom.visited) neighbours.push(bottom);
        if (left && !left.visited) neighbours.push(left);

        if (neighbours.length !== 0) {
            let random = Math.floor(Math.random() * neighbours.length);
            return neighbours[random]; //this will get a random neighbour every time
        }
        else { //this will be used for backtracking. If there's no neighbours left, it backtracks
            return undefined;
        }



    }

    //Below the functions to draw each of the walls of the cells
    drawTopWall(x, y, size, columns) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size / columns, y);
        ctx.stroke();
    }
    drawRightWall(x, y, size, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x + size / columns, y);
        ctx.lineTo(x + size / columns, y + size / rows);
        ctx.stroke();
    }
    drawBottomWall(x, y, size, columns, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y + size / rows);
        ctx.lineTo(x + size / columns, y + size / rows);
        ctx.stroke();
    }
    drawLeftWall(x, y, size, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + size / rows);
        ctx.stroke();
    }

    //function to highlight the current cell 
    highlight(columns) {
        let x = (this.colNum * this.parentSize) / columns + 1;
        let y = (this.rowNum * this.parentSize) / columns + 1;

        ctx.fillStyle = "purple"
        ctx.fillRect(x, y, this.parentSize / columns - 3, this.parentSize / columns - 3);
    }

    removeWall(cell1, cell2) {
        let x = (cell1.colNum - cell2.colNum);

        if (x == 1) { //checking for cell neighbour on the right
            cell1.walls.leftWall = false;
            cell2.walls.righWall = false;

        } else if (x == -1) { //checking for cell neighbour on the left
            cell1.walls.righWall = false;
            cell2.walls.leftWall = false;
        }

        let y = (cell1.rowNum - cell2.rowNum);

        if (y == 1) { //checking for cell neighbour on the bottom
            cell1.walls.topWall = false;
            cell2.walls.bottomWall = false;
        } else if (y == -1) { //checking for cell neighbour on the top
            cell1.walls.bottomWall = false;
            cell2.walls.topWall = false;
        }
    }

    show(size, rows, columns) {
        //calculates the top left coordinates for the cell
        let x = (this.colNum * size) / columns;
        let y = (this.rowNum * size) / rows;

        ctx.strokeStyle = "black"; //set colour of the walls
        ctx.fillStyle = "white"; //set fill colour of the cells
        ctx.lineWidth = 2;

        if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
        if (this.walls.righWall) this.drawRightWall(x, y, size, columns, rows);
        if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
        if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
        if (this.visited) {
            ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
        }

    }

    //to highlight a cell with a specific colour (will be used to set start point in green and end point in red)
    highlightSpecific(colour) {
        let x = (this.colNum * this.parentSize) / this.parentGrid.length;
        let y = (this.rowNum * this.parentSize) / this.parentGrid.length;

        ctx.fillStyle = colour;
        ctx.fillRect(x + 1, y + 1, this.parentSize / this.parentGrid.length - 2, this.parentSize / this.parentGrid.length - 2);
    }
}


let newMaze;

function initMaze() {
    //instantiation of the maze, parameters can be changed to make the maze smaller or bigger
    newMaze = new Maze(500, 12, 12);
    newMaze.setup();
    newMaze.draw();
}

//Initialise the first maze when the page opens
window.onload = initMaze();