/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { envVars } from "../../config/env";
import { catchAsync } from "../../shared/catchAsync";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";

const handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error(`Missing stripe signature or webhook secret`);
    return res
      .status(status.BAD_REQUEST)
      .json({ message: "Missing stripe signature or webhook secret" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Error processing stripe webhook event: ${error.message}`);
    return res.status(status.BAD_REQUEST).json({
      message: `Error processing stripe webhook event: ${error.message}`,
    });
  }

  try {
    const result = await PaymentService.handleStripeWebhookEvent(event);
    sendResponse(res, {
      httpStatus: status.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result,
    });
  } catch (error) {
    console.error(`Error processing stripe webhook event: ${error}`);
    sendResponse(res, {
      httpStatus: status.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Error processing stripe webhook event",
      data: error,
    });
  }
});

export const paymentController = {
  handleStripeWebhookEvent,
};
