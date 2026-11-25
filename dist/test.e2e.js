import { createHmac } from "node:crypto";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";
import { redis, getTopRankings } from "./lib/redis.js";
import { env } from "./config/env.js";
async function runE2ETest() {
    console.log("=== STARTING INDIAbids BACKEND END-TO-END TEST ===");
    // Helper for requests
    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}/api/v1`;
    try {
        // 1. Check boards
        console.log("Step 1: Fetching National board for tech-ai...");
        const boardRes = await fetch(`${baseUrl}/boards/tech-ai-national`);
        const boardData = await boardRes.json();
        if (!boardData.success)
            throw new Error("Failed to get board: " + JSON.stringify(boardData));
        const board = boardData.data.board || boardData.data;
        console.log(`Board found: ${board.name} (Scope: ${board.scope}, MinBid: ${board.minBidPaise})`);
        // 2. Place an anonymous bid
        console.log("Step 2: Placing anonymous bid for 'Acme AI India'...");
        const bidRes = await fetch(`${baseUrl}/bids`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                boardId: board.id,
                name: "Acme AI India",
                website: "https://acmeai.in",
                description: "India's next-gen AI platform",
                contactEmail: "founder@acmeai.in",
                amountPaise: "75000", // ₹750
            }),
        });
        const bidResult = await bidRes.json();
        if (!bidResult.success)
            throw new Error("Bid placement failed: " + JSON.stringify(bidResult));
        const { paymentId, orderId, manageToken, businessId } = bidResult.data;
        console.log("Bid placed successfully:", { paymentId, orderId, businessId, hasManageToken: !!manageToken });
        if (!manageToken)
            throw new Error("Expected manageToken for anonymous user!");
        // 3. Verify Business in DB has ownerId = null and manageTokenHash set
        const bizInDb = await prisma.business.findUnique({ where: { id: businessId } });
        if (bizInDb?.ownerId !== null)
            throw new Error("Expected business.ownerId to be null for anonymous!");
        if (!bizInDb?.manageTokenHash)
            throw new Error("Expected manageTokenHash to be stored!");
        // 4. Simulate Razorpay Webhook (payment.captured)
        console.log("Step 3: Simulating Razorpay Webhook (payment.captured)...");
        const eventId = `evt_test_${Date.now()}`;
        const providerPaymentId = `pay_test_${Date.now()}`;
        const webhookPayload = JSON.stringify({
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: providerPaymentId,
                        order_id: orderId,
                        amount: 75000,
                        currency: "INR",
                        status: "captured",
                    },
                },
            },
        });
        const signature = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
            .update(webhookPayload)
            .digest("hex");
        const webhookRes = await fetch(`${baseUrl}/payments/webhooks/razorpay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Razorpay-Signature": signature,
                "X-Razorpay-Event-Id": eventId,
            },
            body: webhookPayload,
        });
        const webhookResult = await webhookRes.json();
        console.log("Webhook result:", webhookResult);
        if (!webhookResult.received)
            throw new Error("Webhook processing failed!");
        // 5. Verify payment status is now SUCCEEDED
        const statusRes = await fetch(`${baseUrl}/payments/status/${paymentId}`);
        const statusData = await statusRes.json();
        if (statusData.data.status !== "SUCCEEDED") {
            throw new Error(`Expected payment SUCCEEDED, got ${statusData.data.status}`);
        }
        console.log("Payment status confirmed:", statusData.data.status);
        // 6. Verify Redis Leaderboard has rank 1 in O(log N)
        console.log("Step 4: Checking Redis Leaderboard...");
        const redisRanks = await getTopRankings(board.id);
        console.log("Redis Rankings:", redisRanks);
        if (redisRanks[0]?.businessId !== businessId) {
            throw new Error(`Expected business ${businessId} to be rank 1 in Redis, got: ${redisRanks[0]?.businessId}`);
        }
        // 7. Verify Leaderboard API endpoint
        const lbRes = await fetch(`${baseUrl}/bids/${board.id}/leaderboard`);
        const lbData = await lbRes.json();
        console.log("Leaderboard API response:", lbData.data);
        if (lbData.data.leaderboard[0]?.business.id !== businessId) {
            throw new Error("Leaderboard API did not return Acme AI India at rank 1");
        }
        // 8. Anonymous manage listing via manageToken
        console.log("Step 5: Accessing anonymous manage endpoint with manageToken...");
        const manageRes = await fetch(`${baseUrl}/manage/${manageToken}`);
        const manageData = await manageRes.json();
        if (!manageData.success)
            throw new Error("Manage token lookup failed!");
        console.log("Manage listing verified:", manageData.data.business.name);
        // 9. Register a user and claim the listing
        console.log("Step 6: Registering user and claiming listing...");
        const testEmail = `founder_${Date.now()}@example.com`;
        const regRes = await fetch(`${baseUrl}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "SuperSecretPassword123!",
                name: "Ritwik Founder",
            }),
        });
        const regData = await regRes.json();
        const accessToken = regData.data.accessToken;
        // Claim listing
        const claimRes = await fetch(`${baseUrl}/manage/${manageToken}/claim`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const claimData = await claimRes.json();
        if (!claimData.success)
            throw new Error("Claim failed: " + JSON.stringify(claimData));
        console.log("Claim successful! New owner:", claimData.data.business.ownerId);
        // 10. Verify old anonymous manage link now 404s
        console.log("Step 7: Verifying old anonymous manage link now 404s...");
        const oldManageRes = await fetch(`${baseUrl}/manage/${manageToken}`);
        console.log("Old manage link status code:", oldManageRes.status);
        if (oldManageRes.status !== 404) {
            throw new Error(`Expected 404 on claimed manageToken, got ${oldManageRes.status}`);
        }
        // 11. Verify business now appears in authenticated user's /businesses/mine
        console.log("Step 8: Verifying listing appears in authenticated dashboard...");
        const mineRes = await fetch(`${baseUrl}/businesses/mine`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const mineData = await mineRes.json();
        if (mineData.data.businesses.length !== 1 || mineData.data.businesses[0].id !== businessId) {
            throw new Error("Listing not found in user dashboard!");
        }
        console.log("User listings in dashboard:", mineData.data.businesses[0].name);
        console.log("\n==========================================");
        console.log(">>> ALL BACKEND FLOWS PASSED PERFECTLY! <<<");
        console.log("==========================================\n");
    }
    finally {
        server.close();
    }
}
runE2ETest()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
});
