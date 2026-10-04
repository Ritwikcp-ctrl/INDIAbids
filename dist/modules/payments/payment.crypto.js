import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env";
function safeCompare(expected, received) {
    const expectedBuffer = Buffer.from(expected, "utf8");
    const receivedBuffer = Buffer.from(received, "utf8");
    if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
    }
    return timingSafeEqual(expectedBuffer, receivedBuffer);
}
export function verifyCheckoutSignature(orderId, paymentId, signature) {
    const message = `${orderId}| ${paymentId}`;
    const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(message, "utf8")
        .digest("hex");
    return safeCompare(expected, signature);
}
export function verifyWebhookSignature(rawBody, receivedSignature) {
    const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");
    return safeCompare(expected, receivedSignature);
}
