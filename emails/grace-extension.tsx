import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function GraceExtensionEmail({
  projectTitle,
  projectUrl,
}: {
  projectTitle: string;
  projectUrl: string;
}) {
  return (
    <EmailLayout previewText="Founder grace activated. 6 extra hours.">
      <h1 style={{ color: "#F59E0B", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        GRACE PERIOD UNLOCKED
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Your project <strong>{projectTitle}</strong> hit the deadline, but your Founder Pass saved you.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        You have been granted an automatic 6-hour extension. This is your final safety net.
      </p>
      <EmailCta href={projectUrl} label="LAUNCH NOW" />
    </EmailLayout>
  );
}

export default GraceExtensionEmail;
