import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// pdfjs-dist references DOMMatrix at module-level; jsdom doesn't provide it.
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    m11 = 1;
    m12 = 0;
    m13 = 0;
    m14 = 0;
    m21 = 0;
    m22 = 1;
    m23 = 0;
    m24 = 0;
    m31 = 0;
    m32 = 0;
    m33 = 1;
    m34 = 0;
    m41 = 0;
    m42 = 0;
    m43 = 0;
    m44 = 1;
    is2D = true;
    isIdentity = true;
    multiply(_other?: DOMMatrix) {
      return this;
    }
    translate(_tx?: number, _ty?: number, _tz?: number) {
      return this;
    }
    scale(
      _scaleX?: number,
      _scaleY?: number,
      _scaleZ?: number,
      _originX?: number,
      _originY?: number,
      _originZ?: number,
    ) {
      return this;
    }
    inverse() {
      return this;
    }
    transformPoint(_point?: DOMPointInit): DOMPoint {
      return new DOMPoint();
    }
    toFloat32Array() {
      return new Float32Array(16);
    }
    toFloat64Array() {
      return new Float64Array(16);
    }
    toString() {
      return 'matrix(1, 0, 0, 1, 0, 0)';
    }
  } as unknown as typeof DOMMatrix;
}

afterEach(() => {
  cleanup();
});

let originalIntersectionObserver: typeof IntersectionObserver;
let originalResizeObserver: typeof ResizeObserver;

beforeAll(() => {
  if (!document.elementFromPoint) {
    document.elementFromPoint = vi.fn(() => document.createElement('div'));
  }

  originalIntersectionObserver = globalThis.IntersectionObserver;
  originalResizeObserver = globalThis.ResizeObserver;

  class IntersectionObserverMock implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: number[] = [];
    callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe = vi.fn();
    scrollMargin = '';
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  }

  class ResizeObserverMock implements ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  globalThis.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;

  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
});

afterAll(() => {
  vi.restoreAllMocks();
  globalThis.IntersectionObserver = originalIntersectionObserver;
  globalThis.ResizeObserver = originalResizeObserver;
});
