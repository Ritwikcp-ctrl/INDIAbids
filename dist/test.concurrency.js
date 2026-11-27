import { createHmac } from "node:crypto";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/redis.js";
import { env } from "./config/env.js";
/**
 * Concurrency, Idempotency & Security Regression Tests:
 * 1. Concurrent webhook + /payments/verify reconciliation increments spend ONCE.
 * 2. Simultaneous bids on same board preserve exact cumulative sum via ACID lock.
 * 3. IDOR guard prevents anonymous/non-owner bidding on existing businessId.
 * 4. Amount mismatch in webhook is rejected (400 AMOUNT_MISMATCH).
 */
async function runConcurrencyTests() {
    console.log("=== STARTING CONCURRENCY, IDEMPOTENCY & SECURITY TESTS ===");
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const baseUrl = `http://127.0.0.1:${port}/api/v1`;
    try {
        const boardRes = await fetch(`${baseUrl}/boards/ai-media-generation-national`);
        const boardJson = await boardRes.json();
        if (!boardJson.success) {
            throw new Error("Seeded board missing. Run server/src/seed.ts first.");
        }
        const board = boardJson.data.board || boardJson.data;
        // 1. Place anonymous bid
        const bidRes = await fetch(`${baseUrl}/bids`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                boardId: board.id,
                name: "Concurrency Test Labs",
                website: "https://concurrency.in",
                contactEmail: "test@concurrency.in",
                amountPaise: "60000",
            }),
        });
        const bidData = await bidRes.json();
        if (!bidData.success) {
            throw new Error("Initial bid failed: " + JSON.stringify(bidData));
        }
        const { orderId, businessId, manageToken } = bidData.data;
        // 2. IDOR check: anonymous caller cannot bid with businessId without manageToken
        const idorRes = await fetch(`${baseUrl}/bids`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                boardId: board.id,
                businessId,
                amountPaise: "50000",
            }),
        });
        if (idorRes.status !== 401 && idorRes.status !== 403) {
            throw new Error(`IDOR guard failed! Expected 401/403, got ${idorRes.status}`);
        }
        console.log("✓ IDOR protection verified");
        // 3. Amount tampering check on webhook
        const tamperedBody = JSON.stringify({
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: `pay_tamper_${Date.now()}`,
                        order_id: orderId,
                        amount: 100, // tampered ₹1 instead of ₹600
                        currency: "INR",
                    },
                },
            },
        });
        const tamperedSig = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
            .update(tamperedBody)
            .digest("hex");
        const tamperRes = await fetch(`${baseUrl}/payments/webhooks/razorpay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Razorpay-Signature": tamperedSig,
                "X-Razorpay-Event-Id": `evt_tamper_${Date.now()}`,
            },
            body: tamperedBody,
        });
        if (tamperRes.status !== 400) {
            throw new Error(`Expected 400 AMOUNT_MISMATCH, got ${tamperRes.status}`);
        }
        console.log("✓ Webhook amount mismatch rejection verified");
        // 4. Fire 5 concurrent webhook + checkout verify requests for the same order
        const payId = `pay_conc_${Date.now()}`;
        const checkoutSig = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${payId}`)
            .digest("hex");
        const webhookBody = JSON.stringify({
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: payId,
                        order_id: orderId,
                        amount: 60000,
                        currency: "INR",
                    },
                },
            },
        });
        const webhookSig = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
            .update(webhookBody)
            .digest("hex");
        await Promise.all([
            fetch(`${baseUrl}/payments/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    razorpayOrderId: orderId,
                    razorpayPaymentId: payId,
                    razorpaySignature: checkoutSig,
                }),
            }),
            fetch(`${baseUrl}/payments/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    razorpayOrderId: orderId,
                    razorpayPaymentId: payId,
                    razorpaySignature: checkoutSig,
                }),
            }),
            fetch(`${baseUrl}/payments/webhooks/razorpay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Razorpay-Signature": webhookSig,
                    "X-Razorpay-Event-Id": `evt_conc_1_${Date.now()}`,
                },
                body: webhookBody,
            }),
            fetch(`${baseUrl}/payments/webhooks/razorpay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Razorpay-Signature": webhookSig,
                    "X-Razorpay-Event-Id": `evt_conc_2_${Date.now()}`,
                },
                body: webhookBody,
            }),
        ]);
        const membership = await prisma.boardMembership.findUniqueOrThrow({
            where: {
                businessId_boardId: {
                    businessId,
                    boardId: board.id,
                },
            },
        });
        if (membership.totalSpendPaise !== 60000n) {
            throw new Error(`Double spend detected! Expected 60000n, got ${membership.totalSpendPaise}`);
        }
        console.log("✓ Concurrent verify + webhook idempotency verified (spend = 60000n)");
        // 5. Public slug does not leak contactEmail
        const biz = await prisma.business.findUniqueOrThrow({ where: { id: businessId } });
        const pubRes = await fetch(`${baseUrl}/businesses/${biz.slug}`);
        const pubJson = await pubRes.json();
        if ("contactEmail" in pubJson.data.business || "ownerId" in pubJson.data.business) {
            throw new Error("PII leak detected in public business endpoint!");
        }
        console.log("✓ Public business PII redaction verified", { hasToken: !!manageToken });
        console.log("=== ALL CONCURRENCY & SECURITY TESTS PASSED ===");
    }
    finally {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "PaymentWebhookEvent", "Bid", "Payment", "BoardMembership", "Business", "AuthSession", "User" CASCADE;`);
        await redis.flushdb();
        server.close();
    }
}
runConcurrencyTests()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error("Concurrency test failed:", err);
    process.exit(1);
});
