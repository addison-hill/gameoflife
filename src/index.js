import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ButtonGroup, DropdownButton, Button, Dropdown } from "react-bootstrap";

class Box extends React.Component {
  selectBox = () => {
    this.props.selectBox(this.props.row, this.props.col);
  };
  render() {
    return (
      <div
        className={this.props.boxClass}
        id={this.props.id}
        onClick={this.selectBox}
      />
    );
  }
}

class Grid extends React.Component {
  render() {
    const width = this.props.cols * 14;
    var rowsArr = [];
    var boxClass = "";
    for (var i = 0; i < this.props.rows; i++) {
      for (var j = 0; j < this.props.cols; j++) {
        let boxId = i + "_" + j;

        boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
        rowsArr.push(
          <Box
            boxClass={boxClass}
            key={boxId}
            boxId={boxId}
            row={i}
            col={j}
            selectBox={this.props.selectBox}
          />
        );
      }
    }
    return (
      <div className="grid" style={{ width: width }}>
        {rowsArr}
      </div>
    );
  }
}

class Buttons extends React.Component {
  handleSelect = (evt) => {
    this.props.gridSize(evt);
  };

  render() {
    return (
      <div className="center">
        <ButtonGroup>
          <Button className="btn btn-default" onClick={this.props.playButton}>
            Play
          </Button>
          <Button className="btn btn-default" onClick={this.props.pauseButton}>
            Pause
          </Button>
          <Button className="btn btn-default" onClick={this.props.clear}>
            Clear
          </Button>
          <Button className="btn btn-default" onClick={this.props.slow}>
            Slow
          </Button>
          <Button className="btn btn-default" onClick={this.props.fast}>
            Fast
          </Button>
          <Button className="btn btn-default" onClick={this.props.seed}>
            Seed
          </Button>
          <DropdownButton
            id="dropdown-basic-button"
            title="Grid Size"
            onSelect={this.handleSelect}
          >
            <Dropdown.Item eventKey="1">20x10</Dropdown.Item>
            <Dropdown.Item eventKey="2">50x30</Dropdown.Item>
            <Dropdown.Item eventKey="3">70x50</Dropdown.Item>
          </DropdownButton>
        </ButtonGroup>
      </div>
    );
  }
}

class Main extends React.Component {
  constructor() {
    super();
    this.speed = 100;
    this.rows = 30;
    this.cols = 50;

    this.state = {
      generation: 0,
      gridFull: Array(this.rows)
        .fill()
        .map(() => Array(this.cols).fill(false)),
    };
  }

  selectBox = (row, col) => {
    let gridCopy = arrayClone(this.state.gridFull);
    gridCopy[row][col] = !gridCopy[row][col];
    this.setState({
      gridFull: gridCopy,
    });
  };

  seed = () => {
    let gridCopy = arrayClone(this.state.gridFull);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (Math.floor(Math.random() * 4) === 1) {
          gridCopy[i][j] = true;
        }
      }
    }
    this.setState({
      gridFull: gridCopy,
    });
  };

  playButton = () => {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.play, this.speed);
  };

  pauseButton = () => {
    clearInterval(this.intervalId);
  };

  slow = () => {
    this.speed = 1000;
    this.playButton();
  };

  fast = () => {
    this.speed = 100;
    this.playButton();
  };

  clear = () => {
    var grid = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false));
    this.setState({
      gridFull: grid,
      generation: 0,
    });
  };

  gridSize = (size) => {
    switch (size) {
      case "1":
        this.cols = 20;
        this.rows = 10;
        break;
      case "2":
        this.cols = 50;
        this.rows = 30;
        break;
      default:
        this.cols = 70;
        this.rows = 50;
    }
    this.clear();
  };

  play = () => {
    let g = this.state.gridFull;
    let g2 = arrayClone(this.state.gridFull);

    // rules from game of life
    // loop through every box and use count to count neighbors
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let count = 0;
        if (i > 0) if (g[i - 1][j]) count++; // if cell has a neighbor to the left or right
        if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++; // if cell has a neighbor to the left or down
        if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++; // if cell has a neighbor to the left or up
        if (j < this.cols - 1) if (g[i][j + 1]) count++; // if cell has a neighbor to the up
        if (j > 0) if (g[i][j - 1]) count++; // if cell has a neighbor to the down
        if (i < this.rows - 1) if (g[i + 1][j]) count++; // if a cell has a neighbor to the right
        if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++; // right, down?
        if (i < this.rows - 1 && j < this.cols - 1)
          if (g[i + 1][j + 1]) count++; // right, up?

        // if a cell has less than 2 neighbors or more than 3 it dies
        if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
        // if a dead cell has 3 neighbors it comes alive
        if (!g[i][j] && count === 3) g2[i][j] = true;
      }
    }
    this.setState({
      gridFull: g2,
      generation: this.state.generation + 1,
    });
  };

  componentDidMount() {
    // this.seed();
    // this.playButton();
  }

  render() {
    return (
      <>
        <div className="background">
          <h1 className="title">The Game of Life</h1>
          <div className="rules-container">
            <div className="rules-1">
              <h3>Rules</h3>
              <p>
                Each live cell with one or no neighbors dies, as if by solitude.
              </p>
              <p>
                Each live cell with four or more neighbors dies, as if by
                overpopulation.
              </p>
              <p>Each live cell with two or three neighbors survives.</p>
              <p>Each dead cell with three neighbors becomes populated.</p>
            </div>
            <div className="instructions">
              <h3>Instructions</h3>
              <p>Click on any cell to make it "alive"</p>
              <p>Click play to see how your simulation plays out</p>
              <p>
                Change the speed, size of the grid, or seed your grid using
                buttons
              </p>
            </div>
          </div>
          <Grid
            gridFull={this.state.gridFull}
            rows={this.rows}
            cols={this.cols}
            selectBox={this.selectBox}
          />
          <h2>Generations: {this.state.generation}</h2>
          <Buttons
            playButton={this.playButton}
            pauseButton={this.pauseButton}
            slow={this.slow}
            fast={this.fast}
            clear={this.clear}
            seed={this.seed}
            gridSize={this.gridSize}
          />
        </div>
      </>
    );
  }
}

function arrayClone(arr) {
  return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(<Main />, document.getElementById("root"));
