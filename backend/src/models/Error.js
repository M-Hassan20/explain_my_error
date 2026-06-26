import mongoose from "mongoose";

const aiExplanationSchema = new mongoose.Schema(
    {
        whatHappened: { type: String, required: true },
        rootCause: { type: String, required: true },
        fix: { type: String, required: true },
        watchOutFor: [{ type: String }],
    },
    { _id: false }
);

const errorSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxLength: 120 },
        errorMessage: { type: String, required: true, trim: true },
        codeSnippet: { type: String, default: null },
        aiExplanation: { type: aiExplanationSchema, required: true },
        solution: { type: String, default: null },
        tags: { type: [String], lowercase: true },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

errorSchema.index({ title: "text", errorMessage: "text" });
errorSchema.index({ tags: 1 });
errorSchema.index({ createdAt: -1 });

const Error = mongoose.model("Error", errorSchema);
export default Error;