/* Geometry check for the charts — the math that silently
   produces NaN or inverted marks. Run: bun test
   Layout and color are verified elsewhere (validator + eyes). */

import { expect, test } from "bun:test";
import { niceScale } from "./shared";
import { barPath } from "./bar-chart";
import { arc } from "./pie-chart";
import { smoothPath } from "./line-chart";

const noNaN = (d: string) => expect(d).not.toContain("NaN");

test("niceScale lands on round steps and brackets the data", () => {
  const s = niceScale(0, 2380);
  expect(s.min).toBe(0);
  expect(s.max).toBeGreaterThanOrEqual(2380);
  expect(s.ticks[0]).toBe(0);
  expect(s.ticks.at(-1)).toBe(s.max);
  /* even steps throughout */
  const step = s.ticks[1] - s.ticks[0];
  s.ticks.forEach((t, i) => expect(Math.abs(t - i * step)).toBeLessThan(1e-6));
});

test("niceScale survives degenerate input", () => {
  for (const [a, b] of [[0, 0], [5, 5], [NaN, 10], [-3, -3]] as [number, number][]) {
    const s = niceScale(a, b);
    expect(Number.isFinite(s.min)).toBe(true);
    expect(Number.isFinite(s.max)).toBe(true);
    expect(s.max).toBeGreaterThan(s.min);
  }
});

test("niceScale spans negatives through zero", () => {
  const s = niceScale(-400, 900);
  expect(s.min).toBeLessThanOrEqual(-400);
  expect(s.max).toBeGreaterThanOrEqual(900);
  expect(s.ticks).toContain(0);
});

test("barPath rounds only the far end and stays finite", () => {
  const top = barPath(10, 20, 24, 100, "top");
  noNaN(top);
  expect(top.startsWith("M10,120")).toBe(true); // begins at the baseline
  expect(top.endsWith("Z")).toBe(true);

  const right = barPath(0, 5, 80, 18, "right");
  noNaN(right);
  expect(right.startsWith("M0,5")).toBe(true);
});

test("barPath refuses degenerate bars instead of drawing garbage", () => {
  expect(barPath(0, 0, 10, 0, "top")).toBe("");
  expect(barPath(0, 0, 0, 10, "top")).toBe("");
  expect(barPath(0, 0, -5, 10, "top")).toBe("");
});

test("barPath clamps the radius on bars thinner than it", () => {
  /* a 3px-wide bar must not grow a 4px corner */
  noNaN(barPath(0, 0, 3, 40, "top"));
  noNaN(barPath(0, 0, 40, 3, "right"));
});

test("arc produces a wedge for a pie and a ring for a doughnut", () => {
  const wedge = arc(100, 100, 90, 0, 0, Math.PI / 2);
  noNaN(wedge);
  expect(wedge.startsWith("M100,100")).toBe(true); // pie wedges start at the center

  const ring = arc(100, 100, 90, 54, 0, Math.PI / 2);
  noNaN(ring);
  expect(ring.startsWith("M100,100")).toBe(false); // doughnuts do not
  expect(ring).toContain("A54,54");
});

test("arc sets the large-arc flag past a half turn", () => {
  expect(arc(0, 0, 10, 0, 0, Math.PI * 0.4)).toContain("0 0 1");
  expect(arc(0, 0, 10, 0, 0, Math.PI * 1.5)).toContain("0 1 1");
});

test("arc handles a single full-circle slice", () => {
  noNaN(arc(50, 50, 40, 20, 0, Math.PI * 2));
});

test("smoothPath interpolates without inventing endpoints", () => {
  const points: [number, number][] = [[0, 10], [10, 40], [20, 5], [30, 25]];
  const d = smoothPath(points);
  noNaN(d);
  expect(d.startsWith("M0,10")).toBe(true);
  expect(d.endsWith("30,25")).toBe(true); // ends exactly on the last point
  expect(d.split("C").length - 1).toBe(3); // one curve per gap
});

test("smoothPath degrades safely on short inputs", () => {
  expect(smoothPath([])).toBe("");
  expect(smoothPath([[1, 1]])).toBe("");
  noNaN(smoothPath([[0, 0], [5, 5]]));
});
