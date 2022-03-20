import { assertEquals } from "assert";

import { printMessage } from "./index.ts";

// deno-lint-ignore no-explicit-any
type callable<T> = (args: any[] | any) => T;
type countedCallable<T> = callable<T> & { count: () => number };

const tryer = <T>(
  func: callable<T>
): ((
  ...args: Parameters<typeof func>
) => [Error, undefined] | [undefined, ReturnType<typeof func>]) => {
  return (...args) => {
    try {
      return [undefined, func(...args)];
    } catch (err) {
      return [err, undefined];
    }
  };
};

const countFrom = (start: number) => {
  return {
    value: start,
    next: () => countFrom(start + 1),
  };
};

const countCalls = <T>(func: callable<T>): countedCallable<T> => {
  let count = countFrom(0);
  const counterWrapper: typeof func = (...args) => {
    count = count.next();
    return func(...args);
  };
  return Object.assign(counterWrapper, { count: () => count.value });
};

Deno.test("it outputs to the console on success", () => {
  const oldConsoleLog = console.log;
  const logSpy = countCalls(oldConsoleLog);
  console.log = logSpy;

  const message = { message: "hello world" };
  const result = printMessage(message);

  assertEquals(result, "hello world");
  assertEquals(logSpy.count(), 1);
  console.log = oldConsoleLog;
});

Deno.test("it throws when it doesn't pass the schema", () => {
  const tryPrintMessage = tryer(printMessage);

  // deno-lint-ignore no-explicit-any
  const brokenMessage = { wrong: "hello world" } as any;
  const [error, result] = tryPrintMessage(brokenMessage);

  assertEquals(error != undefined, true);
  assertEquals(result, undefined);
});
