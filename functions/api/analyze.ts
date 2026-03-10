interface Env {
  "openai-api-key"?: string;
  OPENAI_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // 여러 가능한 환경 변수 이름을 모두 확인합니다.
    const apiKey = context.env["openai-api-key"] || context.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "API 키가 설정되지 않았습니다. Cloudflare 설정에서 'openai-api-key' 또는 'OPENAI_API_KEY'를 확인해주세요." 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { image, height, weight } = await context.request.json() as any;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "developer",
            content: [
              {
                type: "text",
                text: "당신은 전문 AI 스타일리스트입니다. 사용자의 사진과 체형 정보를 분석하여 한국어로 상세 보고서를 작성하세요."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `키: ${height}cm, 몸무게: ${weight}kg.`
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
        max_completion_tokens: 2048,
        temperature: 1,
        store: true
      }),
    });

    const data = await response.json() as any;

    // OpenAI API 자체에서 에러를 반환한 경우 처리
    if (data.error) {
      return new Response(JSON.stringify({ 
        error: `OpenAI API 에러: ${data.error.message || JSON.stringify(data.error)}` 
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "서버 오류: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
