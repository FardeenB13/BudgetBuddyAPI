import { Router } from "express";
import {
  getCategoriesByMonth,
  createCategory,
} from "../controllers/category-controller.js";

const router = Router();

router.get("/", getCategoriesByMonth);
router.post("/", createCategory);

export default router;
