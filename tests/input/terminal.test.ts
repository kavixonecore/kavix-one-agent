import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";

// We mock readline before importing terminal
const questionMock = mock((_prompt: string, cb: (answer: string) => void) => {
  cb("y");
});
const closeMock = mock(() => {});

mock.module("readline", () => ({
  createInterface: () => ({
    question: questionMock,
    close: closeMock,
  }),
}));

const { askTerminal, confirmTerminal, reviewTerminal } = await import(
  "../../src/input/terminal.mjs"
);

beforeEach(() => {
  questionMock.mockClear();
  closeMock.mockClear();
});

afterEach(() => {
  // no teardown needed
});

describe("terminal", () => {
  describe("askTerminal", () => {
    it("returns the trimmed answer from stdin", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("  hello world  ")
      );
      const result = await askTerminal("What is your name?");
      expect(result)
.toBe("hello world");
    });

    it("calls rl.close after answering", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("answer")
      );
      await askTerminal("Question?");
      expect(closeMock)
.toHaveBeenCalledTimes(1);
    });
  });

  describe("confirmTerminal", () => {
    it("returns true when user enters y", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("y")
      );
      const result = await confirmTerminal("Continue?");
      expect(result)
.toBe(true);
    });

    it("returns true when user enters yes (case-insensitive)", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("YES")
      );
      const result = await confirmTerminal("Continue?");
      expect(result)
.toBe(true);
    });

    it("returns false when user enters anything else", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("n")
      );
      const result = await confirmTerminal("Continue?");
      expect(result)
.toBe(false);
    });

    it("returns false on empty input", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("")
      );
      const result = await confirmTerminal("Continue?");
      expect(result)
.toBe(false);
    });
  });

  describe("reviewTerminal", () => {
    it("returns approve when user enters a", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("a")
      );
      const result = await reviewTerminal("user", ["src/user.mts"]);
      expect(result)
.toBe("approve");
    });

    it("returns approve when user enters approve", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("approve")
      );
      const result = await reviewTerminal("user", ["src/user.mts"]);
      expect(result)
.toBe("approve");
    });

    it("returns reject when user enters r", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("r")
      );
      const result = await reviewTerminal("user", ["src/user.mts"]);
      expect(result)
.toBe("reject");
    });

    it("returns skip when user enters any other value", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("s")
      );
      const result = await reviewTerminal("user", []);
      expect(result)
.toBe("skip");
    });

    it("returns skip when user enters empty string", async () => {
      questionMock.mockImplementationOnce(
        (_prompt: string, cb: (answer: string) => void) => cb("")
      );
      const result = await reviewTerminal("product", ["src/product.mts"]);
      expect(result)
.toBe("skip");
    });
  });
});
