import fetch from "node-fetch";

export async function runAgent(agentName: string, payload: any) {
  const prompt = `
Agent: ${agentName}

Task:
${payload.task}

Context:
${payload.context}

Additional files:
${JSON.stringify(payload.additionalFileRequests, null, 2)}
`;

  const response = await fetch("http://localhost:3009/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  return {
    modifiedFiles: {},
    diff: "",
    output: data.output,
    intent: "message"
  };
}
