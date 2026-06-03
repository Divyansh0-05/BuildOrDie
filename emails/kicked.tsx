import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function KickedEmail({
  projectTitle,
  submitUrl,
}: {
  projectTitle: string;
  submitUrl: string;
}) {
  return (
    <EmailLayout previewText={`The clock won this round. ${projectTitle} got kicked.`}>
      <h1 style={{ color: "#FF4D00", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        THE CLOCK WON.
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Your project <strong>{projectTitle}</strong> has been kicked because you ran out of time.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Sitting on ideas is the real failure. Pick yourself up, declare a new idea, and build it faster.
      </p>
      <EmailCta href={submitUrl} label="DECLARE AGAIN" />
    </EmailLayout>
  );
}

export default KickedEmail;
