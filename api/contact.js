/**
 * Vercel Serverless Function — Contact Form Handler
 * 
 * Receives form submissions from the contact form and group inquiry form.
 * Sends email notification to cole@whetstoneadmissions.com.
 * 
 * SETUP: Add RESEND_API_KEY to Vercel environment variables.
 * Get a free key at https://resend.com (100 emails/day free).
 * 
 * If Resend is not configured, submissions are logged to Vercel function logs
 * so no data is lost during setup.
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, email, message, type, org, role, language, size } = body || {};

    // Basic validation
    if (!email) return res.status(400).json({ error: "Email is required" });

    const isGroupInquiry = type === "group_inquiry";

    const subject = isGroupInquiry
      ? `New Group Inquiry from ${name || "Unknown"} — ${org || "No org"}`
      : `New Contact from ${name || "Unknown"} — Whetstone Classical Languages`;

    const textBody = isGroupInquiry
      ? [
          `GROUP INQUIRY`,
          `Name: ${name || "N/A"}`,
          `Email: ${email}`,
          `Organization: ${org || "N/A"}`,
          `Role: ${role || "N/A"}`,
          `Language Interest: ${language || "N/A"}`,
          `Group Size: ${size || "N/A"}`,
          `Message: ${message || "(none)"}`,
        ].join("\n")
      : [
          `CONTACT FORM`,
          `Name: ${name || "N/A"}`,
          `Email: ${email}`,
          `Message: ${message || "(none)"}`,
        ].join("\n");

    // Log to Vercel function logs regardless
    console.log("=== FORM SUBMISSION ===");
    console.log(textBody);
    console.log("=======================");

    // Send via Resend if configured
    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (RESEND_KEY) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Whetstone Classics <onboarding@resend.dev>",
          to: ["cole@whetstoneadmissions.com"],
          subject,
          text: textBody,
          reply_to: email,
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.text();
        console.error("Resend error:", err);
        // Still return 200 — we logged the data
      }
    } else {
      console.warn("RESEND_API_KEY not set — email not sent. Submission logged above.");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
