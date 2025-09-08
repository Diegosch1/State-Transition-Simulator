import { Process } from "./processModel.js";
import { STATES } from "./stateMachine.js";
import fs from "fs";
import path from "path";

function exportCSVWithScenario(process, scenarioName) {
  const metrics = process.getMetrics();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const safeScenarioName = scenarioName.replace(/\s+/g, "_");
  const filename = `report_${safeScenarioName}_${process.pid}_${timestamp}.csv`;

  let csv = "PID,Priority,ProgramCounter,Registers\n";
  csv += `${metrics.pid},${metrics.priority},${metrics.programCounter},` +
         `"AX:${metrics.registers.AX}|BX:${metrics.registers.BX}|CX:${metrics.registers.CX}|DX:${metrics.registers.DX}"\n\n`;

  csv += "State,Time(ms),Transitions,Syscalls\n";

  for (const state in metrics.timeInStates) {
    const time = metrics.timeInStates[state];
    const transitions = metrics.transitions.filter(t => t.state === state).length;
    const syscalls = metrics.syscalls.filter(s => s.success && s.state === state).length || 0;
    csv += `${state},${time},${transitions},${syscalls}\n`;
  }

  if (!fs.existsSync("./reports")) fs.mkdirSync("./reports");
  fs.writeFileSync(path.join("./reports", filename), csv);

  return filename;
}

describe("Process FSM Scenarios with Detailed Metrics", () => {

  test("Scenario 1: Process without I/O", () => {
    const p = new Process("High");

    expect(p.transition(STATES.READY, "Admit")).toEqual(expect.objectContaining({status: true}));
    expect(p.transition(STATES.RUNNING, "Assign CPU")).toEqual(expect.objectContaining({status: true}));
    expect(p.transition(STATES.TERMINATED, "Finish")).toEqual(expect.objectContaining({status: true}));

    const filename = exportCSVWithScenario(p, "Process_without_IO");
    console.log(`CSV generated: ${filename}`);
  });

  test("Scenario 2: Process with 1 I/O operation", () => {
    const p = new Process("Medium");

    expect(p.transition(STATES.READY, "Admit")).toEqual(expect.objectContaining({status: true}));
    expect(p.transition(STATES.RUNNING, "Assign CPU")).toEqual(expect.objectContaining({status: true}));

    expect(p.systemCall("I/O Request", STATES.WAITING, "Request I/O")).toEqual(expect.objectContaining({status: true}));
    expect(p.transition(STATES.READY, "I/O Completed")).toEqual(expect.objectContaining({status: true}));
    expect(p.transition(STATES.RUNNING, "Assign CPU")).toEqual(expect.objectContaining({status: true}));
    expect(p.transition(STATES.TERMINATED, "Finish")).toEqual(expect.objectContaining({status: true}));

    const filename = exportCSVWithScenario(p, "Process_with_1_IO");
    console.log(`CSV generated: ${filename}`);
  });

  test("Scenario 3: Invalid transition attempt", () => {
    const p = new Process("Low");

    const result = p.transition(STATES.TERMINATED, "Invalid attempt");
    expect(result.status).toBe(false);
    expect(p.currentState).toBe(STATES.NEW);

    const filename = exportCSVWithScenario(p, "Invalid_transition_attempt");
    console.log(`CSV generated: ${filename}`);
  });
});
