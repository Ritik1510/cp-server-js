import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createVisitor, deleteVisitor } from "../controllers/visitors.controller.js";

const router = Router();

// visitors routes 
router.post("/visitors", verifyJWT, createVisitor);
router.delete("/:id", verifyJWT, deleteVisitor);
