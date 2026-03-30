import * as PIXI from 'pixi.js';
import { Subject, debounceTime } from 'rxjs';
import { GameEntity } from 'app/engine';
import { EventEmitter } from '@angular/core';

const UI_SCALE = 3;
const TILE_SIZE = 20 * UI_SCALE;

const SIDE_N = 1 << 0;
const SIDE_E = 1 << 1;
const SIDE_S = 1 << 2;
const SIDE_W = 1 << 3;

class Node {
  constructor(
    private _x: number,
    private _y: number,
  ) {}

  public get x() {
    return this._x;
  }
  public get y() {
    return this._y;
  }

  public toString() {
    return `{${this._x}, ${this._y}}`;
  }
}

class Branch {
  public choices: Node[] = [];
  public connections: Node[] = [];
  public distFromRoot = 0;

  constructor(private _node: Node) {}

  public get node() {
    return this._node;
  }
}

export class MazeEntity extends GameEntity {
  private readonly _nodes: Node[] = [];
  private readonly _tree: Branch[] = [];
  private _currentBranch: Branch | null = null;
  private _debugView: PIXI.Container | null = null;
  private _actualMaze: PIXI.Container | null = null;
  private _isDone = false;

  private _gridWidth = 30;
  private _gridHeight = 20;

  private readonly _regenerate$ = new Subject<void>();

  public mazeGenerated = new EventEmitter();

  constructor() {
    super();

    for (let y = 0; y < this._gridHeight; ++y) {
      for (let x = 0; x < this._gridWidth; ++x) {
        this._nodes.push(new Node(x, y));
      }
    }

    this._regenerate$.pipe(debounceTime(300)).subscribe(() => this._doRegenerate());

    window.addEventListener('keydown', this._onKeyDown);
  }

  public set width(value: number) {
    this._gridWidth = value;
    this.regenerate();
  }
  public set height(value: number) {
    this._gridHeight = value;
    this.regenerate();
  }

  public regenerate() {
    this._regenerate$.next();
  }


  override onInitializeOverride(): void {
    this._doRegenerate();
    this._refreshDebugView();
  }

  override onUpdateOverride(delta: PIXI.Ticker): void {
    this._centerContainer();
  }

  private _centerContainer() {
    const padding = 400;
    const screenWidth = this.app!.screen.width;
    const screenHeight = this.app!.screen.height;
    const mazeWidth = (this._gridWidth - 1) * TILE_SIZE;
    const mazeHeight = (this._gridHeight - 1) * TILE_SIZE;

    const scale = Math.min(1, screenWidth / (mazeWidth + padding * 2), screenHeight / (mazeHeight + padding * 2));
    this.engine?.setZoom(scale);

    this.container.x = -(mazeWidth / 2);
    this.container.y = -(mazeHeight / 2);
  }

  override onDestroyOverride(): void {
    this._regenerate$.complete();
    this._regenerate$.unsubscribe();
    window.removeEventListener('keydown', this._onKeyDown);
  }

  private _doRegenerate() {
    this._isDone = false;
    if (this._debugView) {
      this.container.removeChild(this._debugView);
    }
    if (this._actualMaze) {
      this.container.removeChild(this._actualMaze);
    }
    this._tree.splice(0, this._tree.length);
    this._nodes.splice(0, this._nodes.length);

    for (let y = 0; y < this._gridHeight; ++y) {
      for (let x = 0; x < this._gridWidth; ++x) {
        this._nodes.push(new Node(x, y));
      }
    }

    const root = new Branch(this._getNode(0, Math.floor(Math.random() * this._gridHeight)));
    root.choices = this._getValidChoices(root);
    this._tree.push(root);
    this._currentBranch = root;

    this._debugView = new PIXI.Container();
    this._actualMaze = new PIXI.Container();
    this.container.addChild(this._debugView);
    this.container.addChild(this._actualMaze);

    while (!this._isDone) {
      this._calculateNextBranch();
    }
  }

  private _calculateNextBranch() {
    const deepest = this._findDeepestBranchWithChoicesLeft();
    if (!deepest) {
      this._debugView!.alpha = 0;
      this._isDone = true;
      this._buildActualMazeGraphics();
      this.mazeGenerated.emit();
      return;
    }
    const last = this._tree[this._tree.length - 1];
    const idx = Math.floor(Math.random() * deepest.choices.length);
    const choice = deepest.choices[idx];

    const branch = new Branch(choice);
    branch.distFromRoot = deepest.distFromRoot + 1;
    this._tree.push(branch);
    deepest.connections.push(branch.node);
    branch.connections.push(deepest.node);
    if (this._currentBranch === last) {
      this._currentBranch = branch;
    }

    this._refreshChoices();
  }

  private _findDeepestBranchWithChoicesLeft() {
    let branch = null;
    for (let i = this._tree.length - 1; i >= 0; --i) {
      branch = this._tree[i];
      if (branch.choices.length > 0) {
        return branch;
      }
    }
    return null;
  }

  private _refreshChoices() {
    this._tree.forEach((x) => (x.choices = this._getValidChoices(x)));
  }

  private _refreshDebugView() {
    this._debugView!.children.splice(0, this._debugView!.children.length);

    this._drawDebugTree(this._tree);
    this._nodes.forEach(this._drawDebugNode.bind(this));
  }

  private _getValidChoices(branch: Branch) {
    const n = branch.node;
    let result: Node[] = [];
    if (n.x > 0) {
      result.push(this._getNode(n.x - 1, n.y));
    }
    if (n.y > 0) {
      result.push(this._getNode(n.x, n.y - 1));
    }
    if (n.x < this._gridWidth - 1) {
      result.push(this._getNode(n.x + 1, n.y));
    }
    if (n.y < this._gridHeight - 1) {
      result.push(this._getNode(n.x, n.y + 1));
    }
    // filter out nodes that are already in tree
    const nodesInTree = this._tree.map((x) => x.node);
    result = result.filter((x) => !nodesInTree.includes(x));
    return result;
  }

  private _getNode(x: number, y: number) {
    return this._nodes[x + y * this._gridWidth];
  }

  private _buildActualMazeGraphics() {
    const first = this._tree[0].node;
    const firstCircle = new PIXI.Graphics()
      .circle(first.x * TILE_SIZE, first.y * TILE_SIZE, 2 * UI_SCALE)
      .fill(0x369dc6);
    this._actualMaze!.addChild(firstCircle);

    const farthest = this._findFarthestNodeFromRoot() || this._tree[this._tree.length - 1].node;
    const farthestCircle = new PIXI.Graphics()
      .circle(farthest.x * TILE_SIZE, farthest.y * TILE_SIZE, 2 * UI_SCALE)
      .fill(0x9d3626);
    this._actualMaze!.addChild(farthestCircle);

    for (let i = 0; i < this._tree.length; ++i) {
      const b = this._tree[i];

      let sides = SIDE_N | SIDE_E | SIDE_S | SIDE_W;
      if (i === 0) {
        sides &= ~SIDE_W;
      }
      for (const c of b.connections) {
        const vx = b.node.x - c.x;
        const vy = b.node.y - c.y;
        if (vy < 0) {
          sides &= ~SIDE_S;
        } else if (vy > 0) {
          sides &= ~SIDE_N;
        }
        if (vx < 0) {
          sides &= ~SIDE_E;
        } else if (vx > 0) {
          sides &= ~SIDE_W;
        }
      }
      this._drawRect(b.node.x * TILE_SIZE, b.node.y * TILE_SIZE, sides);
    }
  }

  private _findFarthestNodeFromRoot() {
    let maxSteps = 0;
    let maxNode = null;
    for (const b of this._tree) {
      if (b.distFromRoot < maxSteps) {
        continue;
      }
      maxSteps = b.distFromRoot;
      maxNode = b.node;
    }
    return maxNode;
  }

  private _drawDebugTree(tree: Branch[]) {
    for (let i = 0; i < tree.length; ++i) {
      const from = tree[i].node;
      for (const conn of tree[i].connections) {
        this._drawDebugLine(
          from.x * TILE_SIZE,
          from.y * TILE_SIZE,
          conn.x * TILE_SIZE,
          conn.y * TILE_SIZE,
          0xffffff,
        );
      }
    }

    if (this._currentBranch) {
      this._drawDebugBranch(this._currentBranch);
    }
  }
  private _drawDebugBranch(b: Branch) {
    const n = b.node;

    // draw choices
    for (const c of b.choices) {
      this._drawDebugLine(
        n.x * TILE_SIZE,
        n.y * TILE_SIZE,
        c.x * TILE_SIZE,
        c.y * TILE_SIZE,
        0x333333,
      );
    }
  }

  private _drawDebugNode(n: Node) {
    const first = this._tree[0].node;
    const current = this._currentBranch!.node;
    const fill = n === current ? 0xa63df6 : n === first ? 0x369dc6 : 0x222222;
    this._drawDebugRect(n.x * TILE_SIZE, n.y * TILE_SIZE);
    this._drawDebugCircle(n.x * TILE_SIZE, n.y * TILE_SIZE, fill);
  }

  private _drawDebugLine(x1: number, y1: number, x2: number, y2: number, stroke: number) {
    const shape = new PIXI.Graphics()
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .stroke({ width: 0.5 * UI_SCALE, color: stroke });
    this._debugView!.addChild(shape);
  }
  private _drawDebugCircle(x: number, y: number, fill: number) {
    const shape = new PIXI.Graphics().circle(x, y, 2 * UI_SCALE).fill(fill);
    this._debugView!.addChild(shape);
  }
  private _drawDebugRect(x: number, y: number) {
    const shape = new PIXI.Graphics()
      .rect(x - TILE_SIZE / 2, y - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE)
      .stroke(0xffffff);
    shape.alpha = 0.1;
    this._debugView!.addChild(shape);
  }

  private _drawRect(x: number, y: number, sides: number) {
    let shape = new PIXI.Graphics();

    if (sides & SIDE_N) {
      // up-left to up-right
      shape
        .moveTo(x - TILE_SIZE / 2, y - TILE_SIZE / 2)
        .lineTo(x + TILE_SIZE / 2, y - TILE_SIZE / 2);
    }
    if (sides & SIDE_S) {
      // down-left to down-right
      shape
        .moveTo(x - TILE_SIZE / 2, y + TILE_SIZE / 2)
        .lineTo(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    }

    if (sides & SIDE_W) {
      // up-left to down-left
      shape
        .moveTo(x - TILE_SIZE / 2, y - TILE_SIZE / 2)
        .lineTo(x - TILE_SIZE / 2, y + TILE_SIZE / 2);
    }

    if (sides & SIDE_E) {
      // up-right to down-right
      shape
        .moveTo(x + TILE_SIZE / 2, y - TILE_SIZE / 2)
        .lineTo(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    }

    shape.stroke({ width: 2 * UI_SCALE, color: 0x0 });
    this._actualMaze!.addChild(shape);
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      if (this._isDone) {
        this.regenerate();
      } else {
        this._calculateNextBranch();
      }
    } else if (event.key === 'ArrowUp') {
      let idx = this._tree.indexOf(this._currentBranch!);
      if (idx < this._tree.length - 1) {
        ++idx;
        this._currentBranch = this._tree[idx];
      }
    } else if (event.key === 'ArrowDown') {
      let idx = this._tree.indexOf(this._currentBranch!);
      if (idx > 0) {
        --idx;
        this._currentBranch = this._tree[idx];
      }
    }
  };
}
