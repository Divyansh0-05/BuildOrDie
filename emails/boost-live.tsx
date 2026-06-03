import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function BoostLiveEmail({
  projectTitle,
  durationDays = 7,
  projectUrl,
}: {
  projectTitle: string;
  durationDays?: number;
  projectUrl: string;
}) {
  return (
    <EmailLayout previewText={`Your ad for ${projectTitle} is live now!`}>
      <h1 style={{ color: "#00D680", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        YOUR AD IS LIVE.
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Boost active. <strong>{projectTitle}</strong> is now featured on the BuildOrDie homepage for the next {durationDays} days.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Use this window to drive eyeballs, collect feedback, and stack up those votes.
      </p>
      <EmailCta href={projectUrl} label="VIEW HOMEPAGE" />
    </EmailLayout>
  );
}

export default BoostLiveEmail;
