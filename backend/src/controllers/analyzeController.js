import { analyzeError } from "../services/geminiService.js";

export const analyze = async (req, res) => {
    const { errorMessage, codeSnippet } = req.body;

    if(!errorMessage.trim()) 
        return res.status(400).json({ error: "errorMessage is required" });
    

    if (errorMessage.length > 10000)
        return res.status(400).json({ error: "errorMessage exceeds 10,000 character limit" });

    try {
        const result = await analyzeError(errorMessage.trim(), codeSnippet?.trim() || null);
        return res.status(200).json(result);
    } catch (err) {
        console.error("Gemini analysis failed:", err.message);
        return res.status(502).json({ error: "AI analysis failed", detail: err.message });
    }
};