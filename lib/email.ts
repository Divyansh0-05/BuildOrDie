import { Resend } from "resend";
import { render } from "@react-email/components";
import React from "react";

// Import email templates
import { WelcomeEmail } from "@/emails/welcome";
import { IdeaDeclaredEmail } from "@/emails/idea-declared";
import { WarningEmail } from "@/emails/warning";
import { GraceExtensionEmail } from "@/emails/grace-extension";
import { KickedEmail } from "@/emails/kicked";
import { LaunchedEmail } from "@/emails/launched";
import { FeaturedEmail } from "@/emails/featured";
import { FounderPassEmail } from "@/emails/founder-pass";
import { BoostQueuedEmail } from "@/emails/boost-queued";
import { BoostLiveEmail } from "@/emails/boost-live";
import { InvestorInterestEmail } from "@/emails/investor-interest";

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

// Async template renderer helpers

export async function welcomeEmail() {
  const element = React.createElement(WelcomeEmail);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "Welcome to BuildOrDie. Now build something.",
    html,
    text,
  };
}

export async function ideaDeclaredEmail(
  projectTitle: string,
  deadlineStr: string,
  projectUrl: string
) {
  const element = React.createElement(IdeaDeclaredEmail, {
    projectTitle,
    deadlineStr,
    projectUrl,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "Clock started. 96 hours. Go.",
    html,
    text,
  };
}

export async function warningEmail(projectTitle: string, projectUrl: string) {
  const element = React.createElement(WarningEmail, {
    projectTitle,
    projectUrl,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "6 hours left. Launch or get kicked.",
    html,
    text,
  };
}

export async function graceExtensionEmail(projectTitle: string, projectUrl: string) {
  const element = React.createElement(GraceExtensionEmail, {
    projectTitle,
    projectUrl,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "Founder grace unlocked. 6 more hours.",
    html,
    text,
  };
}

export async function kickedEmail(projectTitle: string, appUrl: string) {
  const submitUrl = `${appUrl}/submit`;
  const element = React.createElement(KickedEmail, {
    projectTitle,
    submitUrl,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "You got kicked. The clock won. Go again.",
    html,
    text,
  };
}

export async function launchedEmail(
  projectTitle: string,
  projectUrl: string,
  shareUrl: string,
  tweetText: string
) {
  const element = React.createElement(LaunchedEmail, {
    projectTitle,
    projectUrl,
    shareUrl,
    tweetText,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "You shipped it. Now get votes. Share this.",
    html,
    text,
  };
}

export async function boostLiveEmail(
  projectTitle: string,
  projectUrl: string,
  durationDays = 7
) {
  const element = React.createElement(BoostLiveEmail, {
    projectTitle,
    durationDays,
    projectUrl,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "Your ad is live now. 7 days on the homepage.",
    html,
    text,
  };
}

export async function featuredEmail(projectTitle: string, projectUrl: string) {
  const element = React.createElement(FeaturedEmail, {
    projectTitle,
    projectUrl,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "Your project is featured on BuildOrDie.",
    html,
    text,
  };
}

export async function founderPassEmail() {
  const element = React.createElement(FounderPassEmail);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: "Founder Pass unlocked. You now have 2 ideas and a 6h safety net.",
    html,
    text,
  };
}

export async function boostQueuedEmail(
  projectTitle: string,
  dateStr: string,
  projectUrl: string
) {
  const element = React.createElement(BoostQueuedEmail, {
    projectTitle,
    liveDateStr: dateStr,
    projectUrl,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: `Boost confirmed. Your ad goes live on ${dateStr}.`,
    html,
    text,
  };
}

export async function investorInterestEmail(
  projectTitle: string,
  investorName: string,
  investorEmail: string,
  builderName: string
) {
  const element = React.createElement(InvestorInterestEmail, {
    projectTitle,
    investorName,
    investorEmail,
    builderName,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return {
    subject: `An investor is interested in ${projectTitle}.`,
    html,
    text,
  };
}
