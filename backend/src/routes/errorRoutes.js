import { Router } from "express";
import {
    createError, getErrors, searchErrors, getErrorById, updateError, deleteError
} from "../controllers/errorController.js";

const router = Router();

// search must be before /:id

router.get("/search", searchErrors);
router.get("/", getErrors);
router.post("/", createError);
router.get("/:id", getErrorById);
router.patch("/:id", updateError);
router.delete("/:id", deleteError);

export default router;