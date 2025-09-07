import { Process } from "./processModel.js";
import { STATES } from "./stateMachine.js";

describe("Process Model", () => {
  let process;

  beforeEach(() => {
    process = new Process();
  });

  test("should create process with default attributes", () => {
    expect(process.pid).toHaveLength(6);
    expect(process.priority).toBe("High");
    expect(process.currentState).toBe(STATES.NEW);
    expect(process.programCounter).toBe(0);
    expect(process.registers).toEqual({ AX: 0, BX: 0, CX: 0, DX: 0 });
    expect(Array.isArray(process.syscalls)).toBe(true);
    expect(process.history.length).toBe(1);
  });

  test("should allow valid transition and update CPU context", () => {
    const result = process.transition(STATES.READY, "Init Ready");
    expect(result.status).toBe(true);
    expect(process.currentState).toBe(STATES.READY);
    expect(process.programCounter).toBeGreaterThan(0);

    const { AX, BX, CX, DX } = process.registers;
    expect(AX).toBeGreaterThanOrEqual(0);
    expect(AX).toBeLessThan(100);
    expect(BX).toBeLessThan(100);
  });

  test("should reject invalid transition", () => {
    const result = process.transition(STATES.RUNNING, "Invalid Jump");
    expect(result.status).toBe(false);
    expect(process.currentState).toBe(STATES.NEW);
  });

  test("should execute successful syscall with transition", () => {
    process.transition(STATES.READY);
    const result = process.systemCall("I/O Request", STATES.RUNNING, "Syscall");
    expect(result.status).toBe(true);

    const lastSyscall = process.syscalls[process.syscalls.length - 1];
    expect(lastSyscall.name).toBe("I/O Request");
    expect(lastSyscall.success).toBe(true);
    expect(process.currentState).toBe(STATES.RUNNING);
  });

  test("should record failed syscall when transition is invalid", () => {
    const result = process.systemCall("Terminate", STATES.TERMINATED, "Invalid syscall");
    expect(result.status).toBe(false);

    const lastSyscall = process.syscalls[process.syscalls.length - 1];
    expect(lastSyscall.success).toBe(false);
    expect(process.currentState).toBe(STATES.NEW);
  });

  test("should keep history of transitions", () => {
    process.transition(STATES.READY);
    process.transition(STATES.RUNNING);
    const history = process.getHistory();

    expect(history.length).toBeGreaterThan(2);
    expect(history[0].state).toBe(STATES.NEW);
    expect(history[history.length - 1].state).toBe(STATES.RUNNING);
  });

  test("should calculate metrics including syscalls and registers", () => {
    process.transition(STATES.READY);
    process.systemCall("I/O", STATES.RUNNING, "Testing syscall");

    const metrics = process.getMetrics();
    expect(metrics).toHaveProperty("pid");
    expect(metrics).toHaveProperty("priority");
    expect(metrics).toHaveProperty("programCounter");
    expect(metrics).toHaveProperty("registers");
    expect(metrics).toHaveProperty("syscalls");
    expect(metrics).toHaveProperty("totalTransitions");
    expect(metrics).toHaveProperty("timeInStates");
    expect(metrics.syscalls.length).toBeGreaterThan(0);
  });

  test("should export metrics to JSON and CSV", () => {
    process.transition(STATES.READY);
    const json = process.exportMetricsJSON();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty("pid");

    const csv = process.exportMetricsCSV();
    expect(csv).toContain("State,Time(ms)");
  });
});
