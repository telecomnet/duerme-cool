import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Store received responses
const responses: any[] = [];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Receive response from n8n
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const response = {
        timestamp: new Date().toISOString(),
        receivedFrom: "n8n_workflow",
        data: body,
      };
      responses.push(response);

      console.log("✅ RESPONSE RECEIVED FROM N8N:", JSON.stringify(response, null, 2));

      return new Response(
        JSON.stringify({
          status: "success",
          message: "Response received from n8n and confirmed",
          responseId: responses.length,
          timestamp: response.timestamp,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to process response",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  // Check responses status
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "active",
        function: "n8n-response-webhook",
        purpose: "Receives responses from n8n workflow",
        totalResponsesReceived: responses.length,
        responses: responses,
        verificationStatus: {
          step3_n8n_response_received: responses.length > 0 ? "✅ YES" : "⏳ WAITING",
          allResponsesReceived: responses,
        },
        instructions: {
          description: "This endpoint receives the response from n8n after it processes a message",
          webhook_url: "https://pzyiygmciubgseieoauw.supabase.co/functions/v1/n8n-response-webhook",
          usage: "When Chatwoot sends a message to n8n, n8n should POST the response back to this URL",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  return new Response("Method not allowed", { status: 405 });
});
