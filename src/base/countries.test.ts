/* Country/dial parsing check — the ambiguous-prefix cases are
   where a phone field quietly picks the wrong flag. Run: bun test */

import { expect, test } from "bun:test";
import { COUNTRIES, countryByIso, countryFlag, countryFromE164, groupDigits } from "./countries";

test("dataset is well formed and unique by ISO", () => {
  const seen = new Set<string>();
  for (const country of COUNTRIES) {
    expect(country.iso).toMatch(/^[A-Z]{2}$/);
    expect(country.dial).toMatch(/^\d+$/);
    expect(country.name.length).toBeGreaterThan(0);
    expect(seen.has(country.iso)).toBe(false);
    seen.add(country.iso);
  }
  expect(COUNTRIES.length).toBeGreaterThan(200);
});

test("flags come from the ISO code, not an asset", () => {
  expect(countryFlag("ID")).toBe("🇮🇩");
  expect(countryFlag("us")).toBe("🇺🇸");
  expect(countryFlag("bad!")).toBe("");
});

test("longest dial code wins so +1 does not swallow +1264", () => {
  /* the whole reason this isn't a startsWith on a sorted list */
  expect(countryFromE164("+12645551234")?.iso).toBe("AI");
  expect(countryFromE164("+6281234567890")?.iso).toBe("ID");
});

test("shared dial codes resolve to the declared primary, not source order", () => {
  /* +1 is US and CA alike — unresolvable from digits, so it must
     at least be STABLE rather than whichever row came first */
  expect(countryFromE164("+14155552671")?.iso).toBe("US");
  expect(countryFromE164("+79161234567")?.iso).toBe("RU");
  expect(countryFromE164("+442071838750")?.iso).toBe("GB");
  expect(countryFromE164("+390612345678")?.iso).toBe("IT");
  expect(countryFromE164("+358401234567")?.iso).toBe("FI");
});

test("countryFromE164 tolerates formatting and rejects nonsense", () => {
  expect(countryFromE164("+62 812 3456 7890")?.iso).toBe("ID");
  expect(countryFromE164("")).toBeUndefined();
  expect(countryFromE164("+999999")).toBeUndefined();
});

test("countryByIso is case insensitive", () => {
  expect(countryByIso("id")?.name).toBe("Indonesia");
  expect(countryByIso("ZZ")).toBeUndefined();
});

test("groupDigits formats without ever dropping a digit", () => {
  expect(groupDigits("4155552671", [3, 3, 4])).toBe("415 555 2671");
  /* partial input stays grouped as far as it goes */
  expect(groupDigits("415555", [3, 3, 4])).toBe("415 555");
  expect(groupDigits("4", [3, 3, 4])).toBe("4");
  /* overflow past the pattern is kept, not truncated */
  expect(groupDigits("41555526719999", [3, 3, 4])).toBe("415 555 2671 9999");
  expect(groupDigits("12345", undefined)).toBe("12345");
  expect(groupDigits("", [3, 3])).toBe("");
});

test("every grouping pattern preserves the digits it is given", () => {
  for (const country of COUNTRIES) {
    if (!country.pattern) continue;
    const digits = "1234567890123";
    expect(groupDigits(digits, country.pattern).replace(/ /g, "")).toBe(digits);
  }
});
