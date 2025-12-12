export interface Command {
  id: string;
  title: string;
  run: () => void | Promise<void>;
}

const commands: Command[] = [];

export function registerCommand(cmd: Command) {
  commands.push(cmd);
}

export function getCommands() {
  return commands;
}
