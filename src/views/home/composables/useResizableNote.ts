import type { ResizeDimensions } from "../types";

interface CalculateResizeInput {
  startWidth: number;
  startHeight: number;
  deltaX: number;
  deltaY: number;
  minWidth: number;
  minHeight: number;
}

interface ResizeStartInput {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

interface ResizeMoveInput {
  clientX: number;
  clientY: number;
}

interface ResizeControllerOptions {
  minWidth: number;
  minHeight: number;
  onPreview: (dimensions: ResizeDimensions) => void;
  onCommit: (dimensions: ResizeDimensions) => void;
}

export function calculateResizedDimensions({
  startWidth,
  startHeight,
  deltaX,
  deltaY,
  minWidth,
  minHeight,
}: CalculateResizeInput): ResizeDimensions {
  const nextWidth = Math.max(minWidth, startWidth + deltaX);
  const nextHeight = Math.max(minHeight, startHeight + deltaY);

  return {
    width: `${nextWidth}px`,
    height: `${nextHeight}px`,
  };
}

export function createResizeController(options: ResizeControllerOptions) {
  let startState: ResizeStartInput | undefined;
  let latestDimensions: ResizeDimensions | undefined;
  let animationFrame = 0;

  const preview = (dimensions: ResizeDimensions) => {
    latestDimensions = dimensions;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    animationFrame = requestAnimationFrame(() => {
      options.onPreview(dimensions);
      animationFrame = 0;
    });
  };

  const start = (input: ResizeStartInput) => {
    startState = input;
    latestDimensions = {
      width: `${input.startWidth}px`,
      height: `${input.startHeight}px`,
    };
  };

  const move = (input: ResizeMoveInput) => {
    if (!startState) {
      return;
    }

    preview(
      calculateResizedDimensions({
        startWidth: startState.startWidth,
        startHeight: startState.startHeight,
        deltaX: input.clientX - startState.startX,
        deltaY: input.clientY - startState.startY,
        minWidth: options.minWidth,
        minHeight: options.minHeight,
      })
    );
  };

  const end = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    if (latestDimensions) {
      options.onCommit(latestDimensions);
    }

    startState = undefined;
    latestDimensions = undefined;
  };

  return { start, move, end };
}
