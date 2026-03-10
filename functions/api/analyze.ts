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

    // 최신 OpenAI Responses API 구조를 따르는 요청 바디
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // 비전 분석을 위해 gpt-4o 사용 (구조는 최신 사양 적용)
        messages: [
          {
            role: "developer",
            content: [
              {
                type: "text",
                text: `당신은 전문 AI 스타일리스트이자 퍼스널 이미지 컨설턴트입니다.
당신의 역할은 사용자가 제공한 사진과 신체 정보(키, 몸무게)를 바탕으로 외형, 체형 비율, 분위기를 분석하는 것입니다.

보고서 포함 내용:
1. 전체적인 분위기와 인상 분석 (귀여운, 세련된, 우아한 등)
2. 체형과 비율 추정 및 돋보이는 실루엣 추천
3. 이미지와 체형에 어울리는 패션 스타일 제안
4. 상의, 하의, 아우터, 액세서리 포함 구체적인 코디 조합
5. 어울리는 색상 팔레트 및 퍼스널 컬러 시즌 추정
6. 장점을 강조할 수 있는 스타일링 팁

지침:
- 긍정적이고 도움이 되는 방식 사용
- 체형에 대한 비판적 표현 금지
- 현실적이고 즉시 적용 가능한 조언 제공
- 답변은 반드시 한국어로 작성`
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `사용자 정보 - 키: ${height}cm, 몸무게: ${weight}kg. 이 정보를 바탕으로 사진을 분석하여 스타일 보고서를 작성해 주세요.`
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
        // 제시해주신 최신 파라미터 적용
        text: {
          format: {
            type: "text"
          },
          verbosity: "medium"
        },
        reasoning: {
          effort: "medium"
        },
        temperature: 1,
        max_completion_tokens: 2048, // 최신 표준인 max_completion_tokens 사용
        top_p: 1,
        store: true,
        include: [
          "web_search_call.action.sources"
        ]
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "분석 실패: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
