import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createApartment } from "../controllers/apartments.controllers.js";

const router = Router();

// apartment routes
router.route("/apartments").post(verifyJWT, createApartment);

export default router;