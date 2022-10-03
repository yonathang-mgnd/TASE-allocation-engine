const functions = require("./functions.js");

test("adds 2 + 2 = 4", () => {
  expect(functions.add(2, 2)).toBe(4);
});

test("adds 2 + 2 NOT equal 5", () => {
  expect(functions.add(2, 2)).not.toBe(5);
});
