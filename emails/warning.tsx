import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function WarningEmail({
  projectTitle,
  projectUrl,
}: {
  projectTitle: string;
  projectUrl: string;
}) {
  return (
    <EmailLayout previewText={`6 hours left to launch ${projectTitle}!`}>
      <h1 style={{ color: "#FF4D00", fontSize: "32px", fontWeight: "900", margin: "0 0 16px 0" }}>
        6 HOURS LEFT
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        <strong>{projectTitle}</strong> is almost out of time.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        You have 6 hours remaining before you get kicked. Ship it now and prove you can get it done.
      </p>
      <EmailCta href={projectUrl} label="LAUNCH NOW" />
    </EmailLayout>
  );
}

export default WarningEmail;
