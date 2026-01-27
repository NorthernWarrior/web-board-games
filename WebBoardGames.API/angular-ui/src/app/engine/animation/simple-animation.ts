export type AnimationRepeatMode = 'once' | 'repeating' | 'ping-pong';

export interface AnimationStepContext<TContextData = any>{
    data: TContextData|null;
    deltaMsSinceStart: number;
    deltaMsForStep: number;
}

export class SimpleAnimation {
  private _repeatMode: AnimationRepeatMode = 'once';

  private _isRunning: boolean = false;
  private _doneCallbacks: (() => void)[] = [];
  private _steps: { step: (ctx: AnimationStepContext<any>, delta: number) => boolean; contextDataCallback: (ctx: AnimationStepContext<any>) => any; }[] = [];
  private _currentStepIndex: number = 0;
  private _context: AnimationStepContext<any> = { data: null, deltaMsSinceStart: 0, deltaMsForStep: 0 };

  public setRepeatMode(value: AnimationRepeatMode): SimpleAnimation {
    this._repeatMode = value;
    return this;
  }

  public addSimple<TContextData = any>(step: (ctx: AnimationStepContext<TContextData>, delta: number) => boolean): SimpleAnimation {
    this._steps.push({ step, contextDataCallback: (ctx)=>ctx.data });
    return this;
  }
  public add<TContextData = any>(captureContextData: (ctx: AnimationStepContext<TContextData>) => TContextData, step: (ctx: AnimationStepContext<TContextData>, delta: number) => boolean): SimpleAnimation {
    this._steps.push({ step, contextDataCallback: captureContextData });
    return this;
  }

  public start(): void {
    if (this._steps.length === 0) {
      return;
    }
    this._isRunning = true;
    this._currentStepIndex = 0;
    this._context = { data: null, deltaMsSinceStart: 0, deltaMsForStep: 0 };
    this._context.data = this._steps[this._currentStepIndex].contextDataCallback(this._context);
  }

  /** Returns true if the animation is finished, false if it is still running */
  public animate(delta: number, deltaMs: number): boolean {
    if (!this._isRunning) {
      return true;
    }
    if (this._currentStepIndex >= this._steps.length) {
      if (this._repeatMode === 'repeating') {
        this._currentStepIndex = 0;
      }
      // TODO: ping-pong mode
      else {
        this._isRunning = false;
        for (const callback of this._doneCallbacks) {
          callback();
        }
        return true;
      }
    }

    this._context.deltaMsSinceStart += deltaMs;
    this._context.deltaMsForStep += deltaMs;
    if (this._steps[this._currentStepIndex].step(this._context, delta)) {
      this._currentStepIndex++;
      this._context.deltaMsForStep = 0;
      if (this._currentStepIndex < this._steps.length) {
        this._context.data = this._steps[this._currentStepIndex].contextDataCallback(this._context);
      }
    }
    return false;
  }

  public done(callback: () => void): SimpleAnimation {
    this._doneCallbacks.push(callback);
    return this;
  }
}
