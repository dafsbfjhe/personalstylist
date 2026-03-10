interface Env {
  OPENAI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { OPENAI_API_KEY } = context.env;
    
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API Key is not configured in Cloudflare environment variables." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { image, height, weight } = await context.request.json() as any;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional personal stylist. Analyze the user's photo, height, and weight to provide a detailed style consulting report. Focus on body type analysis, color recommendations, and specific outfit suggestions. Keep the tone premium and encouraging. Answer in Korean."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `My height is ${height}cm and my weight is ${weight}kg. Based on my photo and these details, please provide a style consulting report.`
              },
              {
                type: "image_url",
                image_url: {
                  url: image // This expects a base64 data URL
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to analyze style: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
