/**
 * ==============================================================================
 * SYNCOPS NOTIFICATION & WEBHOOK TRIGGER SERVICE
 * ==============================================================================
 * 
 * Provides:
 * 1. Client & Admin Automated Notification dispatchers (WhatsApp / Email / Webhook)
 * 2. Pre-formatted WhatsApp deep links with URI encoding for instant architect triage
 * 3. Complete Cloud Function Blueprint (Firebase Functions v2) for serverless execution
 *    when order status updates to 'ACTIVE' in Firestore.
 */

import { Order, WHATSAPP_DIRECT_URL } from '../data/syncOpsData';

export interface NotificationPayload {
  orderId: string;
  clientEmail: string;
  companyName?: string;
  serviceTitle: string;
  totalPrice?: string;
  durationDays?: number;
  deadlineDate?: string;
  timestamp: string;
}

/**
 * Format human-readable deadline date
 */
export function formatDeadlineDate(deadlineDateStr?: string): string {
  if (!deadlineDateStr) return 'TBD (7 Days Sprint)';
  try {
    const d = new Date(deadlineDateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return deadlineDateStr;
  }
}

/**
 * Generates an automated WhatsApp dispatch link with pre-encoded template
 * notifying the client that their architecture has commenced execution.
 */
export function generateWhatsAppActiveNotificationUrl(order: Order, whatsappNumber?: string): string {
  const targetPhone = whatsappNumber?.replace(/[^0-9]/g, '') || '8801608533529';
  const deadline = formatDeadlineDate(order.deadlineDate);

  const message = [
    `🚀 *SYNCOPS ARCHITECTURE DISPATCH: PROJECT ACTIVATED*`,
    ``,
    `Hello ${order.companyName ? order.companyName : 'Partner'},`,
    `Your technical deployment has been approved and moved to *ACTIVE* status.`,
    ``,
    `📦 *Service:* ${order.serviceTitle}`,
    `💰 *Allocated Budget:* ${order.totalPrice || 'Verified Escrow'}`,
    `⏱️ *Sprint Duration:* ${order.durationDays || 7} Days`,
    `📅 *Guaranteed Delivery Deadline:* ${deadline}`,
    ``,
    `🔗 Access your real-time terminal & live countdown:`,
    `https://syncops.studio/client/dashboard`,
    ``,
    `Lead Architect Adesh Chandra is now provisioning your server cluster and containers.`
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an automated WhatsApp notification for when a proposal is ready and Awaiting Funds
 */
export function generateWhatsAppProposalReadyUrl(order: Order, whatsappNumber?: string): string {
  const targetPhone = whatsappNumber?.replace(/[^0-9]/g, '') || '8801608533529';

  const message = [
    `📋 *SYNCOPS ARCHITECTURE PROPOSAL READY*`,
    ``,
    `Hello ${order.companyName ? order.companyName : 'Partner'},`,
    `Your custom architecture scope for *${order.serviceTitle}* has been prepared and approved!`,
    ``,
    `💰 *Fixed Scope Value:* ${order.totalPrice || '$0'}`,
    `⏱️ *Turnaround:* ${order.durationDays || 7} Days`,
    order.paymentUrl ? `💳 *Escrow Payment Link:* ${order.paymentUrl}` : '',
    ``,
    `Review proposal & fund project in your client dashboard:`,
    `https://syncops.studio/client/dashboard`
  ].filter(Boolean).join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an automated WhatsApp notification when the admin submits final deliverables (DELIVERED)
 */
export function generateWhatsAppDeliveredNotificationUrl(order: Order, whatsappNumber?: string): string {
  const targetPhone = whatsappNumber?.replace(/[^0-9]/g, '') || '8801608533529';

  const message = [
    `📦 *SYNCOPS ARCHITECTURE DISPATCH: WORK DELIVERED*`,
    ``,
    `Hello ${order.companyName ? order.companyName : 'Partner'},`,
    `The implementation for *${order.serviceTitle}* has been completed and submitted for your final sign-off!`,
    ``,
    `📁 *Deliverables Attached:* ${(order.deliverables?.length || 0)} files & container repositories`,
    order.deliverySummary ? `📝 *Summary:* ${order.deliverySummary}` : '',
    ``,
    `Please log in to your Client Portal to inspect container verification, test deduplication, and approve the delivery:`,
    `https://syncops.studio/client/dashboard`
  ].filter(Boolean).join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an automated WhatsApp notification when client requests a revision
 */
export function generateWhatsAppRevisionNotificationUrl(order: Order, revisionNotes?: string): string {
  const targetPhone = '8801608533529'; // Lead Architect Adesh Chandra

  const message = [
    `🔄 *SYNCOPS REVISION REQUESTED*`,
    ``,
    `Order: *${order.serviceTitle}* (ID: #${order.id.slice(-6)})`,
    `Client: ${order.clientEmail} (${order.companyName || 'Partner'})`,
    ``,
    `📝 *Client Feedback / Adjustment Scope:*`,
    `${revisionNotes || 'Please review technical specs.'}`,
    ``,
    `Open Admin Order Management:`,
    `https://syncops.studio/admin`
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an automated WhatsApp notification when client approves and completes an order
 */
export function generateWhatsAppCompletedNotificationUrl(order: Order): string {
  const targetPhone = '8801608533529'; // Lead Architect Adesh Chandra

  const message = [
    `🎉 *SYNCOPS ORDER COMPLETED & APPROVED*`,
    ``,
    `Order: *${order.serviceTitle}* (ID: #${order.id.slice(-6)})`,
    `Client: ${order.clientEmail} (${order.companyName || 'Partner'})`,
    `Total Escrow Released: ${order.totalPrice || 'N/A'}`,
    ``,
    `The client has signed off on all deliverables and the order has been archived to permanent record.`
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Client-Side Trigger to notify webhooks or log trigger events
 */
export async function triggerClientNotification(order: Order, event: 'ORDER_ACTIVATED' | 'PROPOSAL_READY' | 'ORDER_DELIVERED' | 'ORDER_COMPLETED' | 'REVISION_REQUESTED'): Promise<boolean> {
  const payload: NotificationPayload = {
    orderId: order.id,
    clientEmail: order.clientEmail,
    companyName: order.companyName,
    serviceTitle: order.serviceTitle,
    totalPrice: order.totalPrice,
    durationDays: order.durationDays,
    deadlineDate: order.deadlineDate,
    timestamp: new Date().toISOString()
  };

  console.info(`[SyncOps Webhook Trigger] Event: ${event}`, payload);

  // Optional: If an external Zapier/Make/Slack webhook URL is configured in environment:
  const webhookUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_NOTIFICATION_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data: payload })
      });
      return true;
    } catch (e) {
      console.warn('[SyncOps Webhook] Non-blocking dispatch notice:', e);
    }
  }

  return true;
}

/**
 * ==============================================================================
 * CLOUD FUNCTION BLUEPRINT (Firebase Cloud Functions v2)
 * ==============================================================================
 * 
 * Paste this implementation into `functions/src/index.ts` in your Firebase CLI project:
 * 
 * ```typescript
 * import { onDocumentUpdated } from "firebase-functions/v2/firestore";
 * import * as logger from "firebase-functions/logger";
 * import * as admin from "firebase-admin";
 * // import sgMail from "@sendgrid/mail"; // or twilio / resend
 * 
 * admin.initializeApp();
 * 
 * export const onOrderStatusChanged = onDocumentUpdated("orders/{orderId}", async (event) => {
 *   const before = event.data?.before.data();
 *   const after = event.data?.after.data();
 * 
 *   if (!before || !after) return;
 * 
 *   // Detect transition to ACTIVE status
 *   if (before.status !== "ACTIVE" && after.status === "ACTIVE") {
 *     const orderId = event.params.orderId;
 *     const clientEmail = after.clientEmail;
 *     const serviceTitle = after.serviceTitle || "Enterprise Architecture";
 *     const deadlineDate = after.deadlineDate ? new Date(after.deadlineDate).toUTCString() : "TBD";
 *     const totalPrice = after.totalPrice || "N/A";
 *     const durationDays = after.durationDays || 7;
 * 
 *     logger.info(`[Order Activated] orderId: ${orderId}, client: ${clientEmail}, deadline: ${deadlineDate}`);
 * 
 *     // 1. Dispatch Transactional Email via SendGrid / Resend / Postmark
 *     // Example using SendGrid:
 *     // sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
 *     // const msg = {
 *     //   to: clientEmail,
 *     //   from: "notifications@syncops.studio",
 *     //   subject: `🚀 [SyncOps] Deployment Activated: ${serviceTitle}`,
 *     //   html: `
 *     //     <h2>Your Architecture Deployment is Officially Active</h2>
 *     //     <p>Our engineering team has verified funds and started the sprint.</p>
 *     //     <ul>
 *     //       <li><strong>Service:</strong> ${serviceTitle}</li>
 *     //       <li><strong>Budget:</strong> ${totalPrice}</li>
 *     //       <li><strong>Duration:</strong> ${durationDays} Days</li>
 *     //       <li><strong>Delivery Deadline:</strong> ${deadlineDate}</li>
 *     //     </ul>
 *     //     <a href="https://syncops.studio/client/dashboard">Open Live Client Workspace</a>
 *     //   `
 *     // };
 *     // await sgMail.send(msg);
 * 
 *     // 2. Dispatch WhatsApp / SMS via Twilio API
 *     // const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
 *     // if (after.whatsappNumber) {
 *     //   await twilioClient.messages.create({
 *     //     from: 'whatsapp:+14155238886',
 *     //     to: `whatsapp:${after.whatsappNumber}`,
 *     //     body: `🚀 SyncOps Alert: Your project "${serviceTitle}" has commenced! Estimated delivery deadline: ${deadlineDate}.`
 *     //   });
 *     // }
 * 
 *     // 3. Mark notificationSent: true on Firestore document
 *     await event.data?.after.ref.update({
 *       notificationSent: true,
 *       notificationSentAt: admin.firestore.FieldValue.serverTimestamp()
 *     });
 *   }
 * });
 * ```
 */
