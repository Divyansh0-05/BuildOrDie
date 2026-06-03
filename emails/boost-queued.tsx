import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function BoostQueuedEmail({
  projectTitle,
  liveDateStr,
  projectUrl,
}: {
  projectTitle: string;
  liveDateStr: string;
  projectUrl: string;
}) {
  return (
    <EmailLayout previewText={`Boost confirmed for ${projectTitle}.`}>
      <h1 style={{ color: "#F59E0B", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        BOOST CONFIRMED
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Your slot has been reserved. <strong>{projectTitle}</strong> will go live in the featured strip on:
      </p>
      <div style={{ background: "#0E0E1C", border: "1px solid #1C1C30", padding: "20px", fontSize: "20px", fontFamily: "monospace", color: "#F59E0B", fontWeight: "bold", margin: "0 0 24px 0", textAlign: "center" as const }}>
        {liveDateStr}
      </div>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        We will notify you the exact moment your boost goes active.
      </p>
      <EmailCta href={projectUrl} label="VIEW PROJECT" />
    </EmailLayout>
  );
}

export default BoostQueuedEmail;
