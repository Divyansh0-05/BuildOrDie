import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`Skipping email "${subject}" to ${to}: RESEND_API_KEY missing.`);
    return { skipped: true };
  }

  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@buildordie.com",
    to,
    subject,
    html,
    text,
  });
}

function cta(url: string, label: string) {
  return `<p><a href="${url}" style="display:inline-block;background:#FF4D00;color:#080810;font-weight:700;padding:12px 16px;text-decoration:none">${label}</a></p>`;
}

export function warningEmail(projectTitle: string, projectUrl: string) {
  return {
    subject: "6 hours left. Launch or get kicked.",
    html: `<div style="background:#1A1A2E;color:#F0F0FF;padding:32px;font-family:Arial,sans-serif"><h1>6 HOURS LEFT</h1><p>${projectTitle} is almost out of time.</p>${cta(projectUrl, "LAUNCH NOW")}</div>`,
    text: `6 HOURS LEFT\n${projectTitle} is almost out of time.\n${projectUrl}`,
  };
}

export function kickedEmail(projectTitle: string, appUrl: string) {
  return {
    subject: "You got kicked. The clock won. Go again.",
    html: `<div style="background:#1A1A2E;color:#F0F0FF;padding:32px;font-family:Arial,sans-serif"><h1>The clock won this round.</h1><p>${projectTitle} got kicked.</p>${cta(`${appUrl}/submit`, "DECLARE AGAIN")}</div>`,
    text: `The clock won this round.\n${projectTitle} got kicked.\n${appUrl}/submit`,
  };
}

export function launchedEmail(projectTitle: string, projectUrl: string) {
  return {
    subject: "You shipped it. Now get votes. Share this.",
    html: `<div style="background:#1A1A2E;color:#F0F0FF;padding:32px;font-family:Arial,sans-serif"><h1>You shipped it.</h1><p>${projectTitle} is live.</p>${cta(projectUrl, "VIEW PROJECT")}</div>`,
    text: `You shipped it.\n${projectTitle} is live.\n${projectUrl}`,
  };
}

export function boostLiveEmail(projectTitle: string, projectUrl: string) {
  return {
    subject: "Your ad is live now. 7 days on the homepage.",
    html: `<div style="background:#1A1A2E;color:#F0F0FF;padding:32px;font-family:Arial,sans-serif"><h1>Your ad is live now.</h1><p>${projectTitle} is boosted.</p>${cta(projectUrl, "VIEW PROJECT")}</div>`,
    text: `Your ad is live now.\n${projectTitle} is boosted.\n${projectUrl}`,
  };
}

export function featuredEmail(projectTitle: string, projectUrl: string) {
  return {
    subject: "Your project is featured on BuildOrDie.",
    html: `<div style="background:#1A1A2E;color:#F0F0FF;padding:32px;font-family:Arial,sans-serif"><h1>You made the strip.</h1><p>${projectTitle} is featured.</p>${cta(projectUrl, "VIEW PROJECT")}</div>`,
    text: `You made the strip.\n${projectTitle} is featured.\n${projectUrl}`,
  };
}
