import { Router } from "express";
import * as PaymentController from "../controllers/payment";

const PaymentRoutes = (router: Router): Router => {
	router.post("/pay-once", PaymentController.payOnce);
	return router;
};

export default PaymentRoutes;
