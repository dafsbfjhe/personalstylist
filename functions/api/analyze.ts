interface Env {
  OPENAI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { OPENAI_API_KEY } = context.env;
    
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API Key is not configured." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { image, height, weight } = await context.request.json() as any;

    // OpenAI REST API implementation based on the requested structure
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using gpt-4o as it supports the requested vision and latest features
        messages: [
          {
            role: "system",
            content: "You are a professional personal stylist. Analyze the user's photo, height, and weight to provide a detailed style consulting report. Focus on body type analysis, color recommendations, and specific outfit suggestions. Answer in Korean."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Height: ${height}cm, Weight: ${weight}kg. Provide a professional style report based on this photo.`
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        // Updated parameters based on the latest API structure
        max_output_tokens: 2048,
        temperature: 1,
        top_p: 1,
        store: true,
        // Optional: Include reasoning if using a model that supports it (like o1/o3)
        // reasoning_effort: "medium" 
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
