import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = `You are an expert software debugger specializing in Node.js, React, SQL, TypeScript, MongoDB, and Java Spring Boot.
 Analyze the error and optional code snippet provided by the user.
 Respond ONLY with a valid JSON object - no markdown, no backticks, no explanation outside the JSON.
 Return this exact structure:
{
  "title": "short descriptive title max 70 chars",
  "aiExplanation": {
    "whatHappened": "plain English, 1-2 sentences",
    "rootCause": "the actual underlying reason, 1-2 sentences",
    "fix": "concrete code snippet or step-by-step fix",
    "watchOutFor": ["variant 1", "variant 2", "variant 3"]
  },
  "tags": ["lowercase tags e.g. react, typeerror, async, node.js, sql"]
}

Rules:
- title must be specific, not generic
- fix should be actual code when possible
- tags: 2-5 items, all lowercase
- watchOutFor: 2-4 items
- If ambiguous, state that in whatHappened and give the most likely cause`;

const stripJsonFences = (text) => {
  // Extract JSON content from anywhere in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0].trim();
  return text.trim();
};

const validateAiResponse = (parsed) => {
    for (const key of ["title", "aiExplanation", "tags"]) {
        if (!parsed[key]) throw new Error(`AI response missing field: ${key}`);
    }
    for (const key of ["whatHappened", "rootCause", "fix", "watchOutFor"]) {
        if (!parsed.aiExplanation[key]) throw new Error(`AI response missing aiExplanation.${key}`);
    }
};

export const analyzeError = async (errorMessage, codeSnippet = null) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.3,
        },
    });

    const userContent = codeSnippet
    ? `Error:\n${errorMessage}\n\nCode Snippet:\n${codeSnippet}`
    : `Error:\n${errorMessage}`;

    const result = await model.generateContent(userContent);
    const cleaned = stripJsonFences(result.response.text());

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(`Gemini returned invalind JSON: ${cleaned.slice(0, 200)}`);
    }

    validateAiResponse(parsed);
    return parsed;
};