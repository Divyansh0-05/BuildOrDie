import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function IdeaDeclaredEmail({
  projectTitle,
  deadlineStr,
  projectUrl,
}: {
  projectTitle: string;
  deadlineStr: string;
  projectUrl: string;
}) {
  return (
    <EmailLayout previewText={`Clock started for ${projectTitle}. 96 hours left.`}>
      <h1 style={{ color: "#F0F0FF", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        CLOCK STARTED.
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        You just declared your idea: <strong>{projectTitle}</strong>.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        You have exactly 96 hours to ship it. Your hard deadline is:
      </p>
      <div style={{ background: "#0E0E1C", border: "1px solid #1C1C30", padding: "16px", fontSize: "18px", fontFamily: "monospace", color: "#FF4D00", fontWeight: "bold", margin: "0 0 24px 0", textAlign: "center" as const }}>
        {deadlineStr}
      </div>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Stop reading. Start building.
      </p>
      <EmailCta href={projectUrl} label="VIEW PROJECT COUNTDOWN" />
    </EmailLayout>
  );
}

export default IdeaDeclaredEmail;
