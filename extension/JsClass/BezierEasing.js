(function (W) {
  'use strict';
  /**
   * Forked from:
   * BezierEasing - use bezier curve for transition easing function
   * by Gaëtan Renaudeau 2014 – MIT License
   *
   * Credits: is based on Firefox's nsSMILKeySpline.cpp
   * Usage:
   * var spline = BezierEasing(0.25, 0.1, 0.25, 1.0)
   * spline(x) => returns the easing value | x must be in [0, 1] range
   *
   */
  W.register('JsClass', 'BezierEasing', {
    // These values are established by empiricism with tests (tradeoff: performance VS precision)
    NEWTON_ITERATIONS: 4,
    NEWTON_MIN_SLOPE: 0.001,
    SUBDIVISION_PRECISION: 0.0000001,
    SUBDIVISION_MAX_ITERATIONS: 10,

    kSplineTableSize: 11,
    kSampleStepSize: 1.0 / (11 - 1.0),

    float32ArraySupported: 'Float32Array' in W.context,

    _precomputed: false,

    __construct: function (mX1, mY1, mX2, mY2) {

      // Validate arguments
      if (arguments.length !== 4) {
        throw new Error("BezierEasing requires 4 arguments.");
      }
      for (var i = 0; i < 4; ++i) {
        if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
          throw new Error("BezierEasing arguments should be integers.");
        }
      }
      if (mX1 < 0 || mX1 > 1 || mX2 < 0 || mX2 > 1) {
        throw new Error("BezierEasing x values must be in [0, 1] range.");
      }

      this.mSampleValues = this.float32ArraySupported ? new Float32Array(this.kSplineTableSize) : new Array(this.kSplineTableSize);

      this.mX1 = mX1;
      this.mY1 = mY1;
      this.mX2 = mX2;
      this.mY2 = mY2;

      this.args = [this.mX1, this.mY1, this.mX2, this.mY2];
    },

    A: function (aA1, aA2) {
      return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    },

    B: function (aA1, aA2) {
      return 3.0 * aA2 - 6.0 * aA1;
    },

    C: function (aA1) {
      return 3.0 * aA1;
    },

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    calcBezier: function (aT, aA1, aA2) {
      return ((this.A(aA1, aA2) * aT + this.B(aA1, aA2)) * aT + this.C(aA1)) * aT;
    },

    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    getSlope: function (aT, aA1, aA2) {
      return 3.0 * this.A(aA1, aA2) * aT * aT + 2.0 * this.B(aA1, aA2) * aT + this.C(aA1);
    },

    binarySubdivide: function (aX, aA, aB, mX1, mX2) {
      var currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = this.calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (Math.abs(currentX) > this.SUBDIVISION_PRECISION && ++i < this.SUBDIVISION_MAX_ITERATIONS);
      return currentT;
    },

    newtonRaphsonIterate: function (aX, aGuessT) {
      for (var i = 0; i < this.NEWTON_ITERATIONS; ++i) {
        var currentSlope = this.getSlope(aGuessT, this.mX1, this.mX2);
        if (currentSlope === 0.0) {
          return aGuessT;
        }
        var currentX = this.calcBezier(aGuessT, this.mX1, this.mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    },

    calcSampleValues: function () {
      for (var i = 0; i < this.kSplineTableSize; ++i) {
        this.mSampleValues[i] = this.calcBezier(i * this.kSampleStepSize, this.mX1, this.mX2);
      }
    },

    getTForX: function (aX) {
      var intervalStart = 0.0;
      var currentSample = 1;
      var lastSample = this.kSplineTableSize - 1;

      for (; currentSample !== lastSample && this.mSampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += this.kSampleStepSize;
      }
      --currentSample;

      // Interpolate to provide an initial guess for t
      var dist = (aX - this.mSampleValues[currentSample]) / (this.mSampleValues[currentSample + 1] - this.mSampleValues[currentSample]);
      var guessForT = intervalStart + dist * this.kSampleStepSize;

      var initialSlope = this.getSlope(guessForT, this.mX1, this.mX2);
      if (initialSlope >= this.NEWTON_MIN_SLOPE) {
        return this.newtonRaphsonIterate(aX, guessForT);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return this.binarySubdivide(aX, intervalStart, intervalStart + this.kSampleStepSize, this.mX1, this.mX2);
      }
    },

    precompute: function () {
      this._precomputed = true;
      if (this.mX1 !== this.mY1 || this.mX2 !== this.mY2) {
        this.calcSampleValues();
      }
    },

    value: function (aX) {
      if (!this._precomputed) {
        this.precompute();
      }
      if (this.mX1 === this.mY1 && this.mX2 === this.mY2) {
        return aX;
      } // linear
      // Because JavaScript number are imprecise, we should guarantee the extremes are right.
      if (aX === 0) {
        return 0;
      }
      if (aX === 1) {
        return 1;
      }
      return this.calcBezier(this.getTForX(aX), this.mY1, this.mY2);
    },

    getControlPoints: function () {
      return [
        { x: this.mX1, y: this.mY1 },
        { x: this.mX2, y: this.mY2 }
      ];
    },

    toString: function () {
      return "BezierEasing(" + this.args + ")";
    },

    toCSS: function () {
      return "cubic-bezier(" + this.args + ")";
    }
  });
}(W));

