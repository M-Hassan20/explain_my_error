import ErrorModel from "../models/Error.js";

export const createError = async (req, res) => {
  const { title, errorMessage: errMsg, codeSnippet, aiExplanation, solution, tags } = req.body;

  if (!title || !errMsg || !aiExplanation)
    return res.status(400).json({ error: "title, errorMessage, and aiExplanation are required" });

  try {
    const doc = await ErrorModel.create({
      title,
      errorMessage: errMsg,
      codeSnippet: codeSnippet || null,
      aiExplanation,
      solution: solution || null,
      tags: tags || [],
      verified: false,
    });
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({ error: "Failed to save error" });
  }
};

export const getErrors = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [docs, total] = await Promise.all([
      ErrorModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      ErrorModel.countDocuments(),
    ])
    return res.status(200).json({ data: docs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ error: "Faild to fetch errors" });
  }
};

export const searchErrors = async (req, res) => {
  const { q, tags } = req.query;

  if (!q && !tags)
    return res.status(400).json({ error: "Provide at least q or tags query param" });

  try {
    const query = {};
    if (q) query.$text = { $search: q };
    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim().toLowerCase());
      query.tags = { $all: tagArray };
    }

    const projection = q ? { score: { $meta: "textScore" } } : {};
    const sort = q ? { score: { $meta: "textScore" } } : { createdAt: -1 };

    const docs = await ErrorModel.find(query, projection).sort(sort).limit(50);
    return res.status(200).json({ data: docs, total: docs.length });
  } catch (err) {
    console.error("Search error detail:", err.message); // add this
    return res.status(500).json({ error: "Search failed", detail: err.message });
  }
};

export const getErrorById = async (req, res) => {
  try {
    const doc = await ErrorModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Error not found" });
    return res.status(200).json(doc);
  } catch {
    return res.status(500).json({ error: "Failed to fetch error" });
  }
};

export const updateError = async (req, res) => {
  const allowedFields = ["verified", "tags", "solution", "title"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (!Object.keys(updates).length)
    return res.status(400).json({ error: "No valid fields to update" });

  try {
    const doc = await ErrorModel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ error: "Error not found" });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update error" });
  }
};

export const deleteError = async (req, res) => {
  try {
    const doc = await ErrorModel.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Error not found" });
    return res.status(200).json({ message: "Deleted successfully" });
  } catch {
    return res.status(500).json({ error: "Failed to delete error" });
  }
};