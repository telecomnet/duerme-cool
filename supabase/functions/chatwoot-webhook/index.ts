import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This function receives webhooks from Chatwoot when messages are created
// It logs the events and can be used to monitor the message flow

serve(async (req) => {
  // Enable CORS for Chatwoot
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Chatwoot-API-Token",
      },
    });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const timestamp = new Date().toISOString();

      // Log the event
      console.log({
        timestamp,
        event: body.event,
        messageId: body.data?.message?.id,
        contactEmail: body.data?.contact?.email,
        content: body.data?.message?.content?.substring(0, 100),
      });

      // Response structure for Chatwoot webhook processing
      const response = {
        status: "received",
        timestamp: timestamp,
        event: body.event,
        processingStatus: "message_received_and_logged",
        details: {
          messageId: body.data?.message?.id,
          contactEmail: body.data?.contact?.email,
          conversationId: body.data?.message?.conversation?.id,
          content: body.data?.message?.content,
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(
        JSON.stringify({
          status: "error",
          message: error instanceof Error ? error.message : "Webhook processing failed",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  // GET endpoint to check webhook status
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "active",
        function: "chatwoot-webhook",
        purpose: "Receives Chatwoot webhooks for message_created events",
        expectedPayload: {
          event: "message_created",
          data: {
            message: {
              id: "message_id",
              content: "message_content",
              message_type: "incoming|outgoing",
              conversation: { id: "conv_id" },
            },
            contact: { id: "contact_id", email: "email@example.com" },
          },
        },
        setupInstructions: [
          "1. Go to Chatwoot Dashboard Settings → Integrations → Webhooks",
          "2. Add webhook URL: https://pzyiygmciubgseieoauw.supabase.co/functions/v1/chatwoot-webhook",
          "3. Select event: message_created",
          "4. Enable the webhook",
          "5. Test by sending a message from the Chatwoot widget",
        ],
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
