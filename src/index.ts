#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

async function main() {
  const transport = new StdioServerTransport();
  // Resources
  server.resource(
    "Greeting",
    "greeting://hello",
    (uri, { }) => {
      console.log(uri)
      return {
        contents: [
          {
            uri: uri.href,
            text: "Hello, world!",
          }
        ]
      }
    })

  server.resource(
    "Greeting with name",
    new ResourceTemplate("greeting://hello/{name1}", {
      list: async () => {
        // fetch users from a database or other source
        await setTimeout(() => { }, 1000);
        // return a list of users
        return {
          resources:
            [
              { name: "Alice", uri: "greeting://hello/Alice" },
              { name: "Bob", uri: "greeting://hello/Bob" },
              { name: "Charlie", uri: "greeting://hello/Charlie" },
            ]
        }
      },
    }),
    (uri, { name }) => {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Hello, ${name}!`,
          }
        ]
      }
    })

  // Prompts
  server.prompt(
    "Japanese Translation",
    {
      englishText: z.string().describe("English text to translate"),
    },
    ({ englishText }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `You are a English to Japanese translator. Please translate the following text into Japanese: ${englishText}`,
        }
      }]
    }));

  // Tools
  server.tool(
    "calculate-bmi",
    "Calculate BMI",
    {
      weightKg: z.number().describe("Weight (kg)"),
      heightM: z.number().describe("Height (m)"),
    },
    ({ weightKg, heightM }) => {
      return {
        content: [
          {
            type: "text",
            text: String(weightKg / (heightM * heightM)),
          }
        ]
      }
    })

  server.connect(transport);
  console.error("my-mcp-server started");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
