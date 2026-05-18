import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recommendationsRouter from "./recommendations";
import productsRouter from "./products";
import skinMetadataRouter from "./skin-metadata";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recommendationsRouter);
router.use(productsRouter);
router.use(skinMetadataRouter);

export default router;
