export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  const { contacts } = await req.json();
  console.log("Received contacts:", contacts);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Be more specific in production
    },
  });
}
