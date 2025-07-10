import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}) {
  // Convert array to comma-separated string if needed
  const toAddress = Array.isArray(to) ? to.join(", ") : to;

  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: toAddress,
    subject,
    html,
    text,
  });
}

/**
 * Creates an HTML email template for different notification types
 */
export function createEmailTemplate({
  type,
  title,
  message,
  data,
}: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  const baseStyles = `
    <style>
      .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
      .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
      .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      .alert { padding: 15px; border-radius: 6px; margin: 15px 0; }
      .alert-success { background-color: #d1fae5; border: 1px solid #10b981; color: #065f46; }
      .alert-info { background-color: #dbeafe; border: 1px solid #3b82f6; color: #1e40af; }
    </style>
  `;

  let actionButton = "";
  let alertClass = "alert-info";

  // Customize template based on notification type
  switch (type) {
    case "MATCHED":
      alertClass = "alert-success";
      actionButton = `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/patient/appointments" class="button">
            View Your Appointments
          </a>
        </div>
      `;
      break;
    case "PATIENT_MATCHED":
      alertClass = "alert-success";
      actionButton = `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/donor/campaigns" class="button">
            View Your Campaign
          </a>
        </div>
      `;
      break;
    case "APPOINTMENT_REMINDER":
      actionButton = `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/patient/appointments" class="button">
            View Appointment Details
          </a>
        </div>
      `;
      break;
    case "RESULT_READY":
      actionButton = `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/patient/results" class="button">
            View Your Results
          </a>
        </div>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${baseStyles}
    </head>
    <body style="background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div class="email-container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">ZeroCancer</h1>
        </div>
        <div class="content">
          <div class="alert ${alertClass}">
            <h2 style="margin: 0 0 10px 0; font-size: 18px;">${title}</h2>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
            ${message}
          </p>
          ${actionButton}
        </div>
        <div class="footer">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            This is an automated notification from ZeroCancer.<br>
            If you have any questions, please contact our support team.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} ZeroCancer. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send notification email with improved template
 */
export async function sendNotificationEmail({
  to,
  type,
  title,
  message,
  data,
}: {
  to: string | string[];
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  const htmlContent = createEmailTemplate({ type, title, message, data });

  return sendEmail({
    to,
    subject: `ZeroCancer - ${title}`,
    text: message,
    html: htmlContent,
  });
}
