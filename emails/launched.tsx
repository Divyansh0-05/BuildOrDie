import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function LaunchedEmail({
  projectTitle,
  projectUrl,
  shareUrl,
  tweetText,
}: {
  projectTitle: string;
  projectUrl: string;
  shareUrl: string;
  tweetText: string;
}) {
  return (
    <EmailLayout previewText={`You shipped ${projectTitle}!`}>
      <h1 style={{ color: "#00D680", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        YOU SHIPPED IT.
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        <strong>{projectTitle}</strong> is live. The clock is stopped. You did it.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Now you need visibility and votes to get featured. Share your launch with your network.
      </p>
      
      <div style={{ background: "#0E0E1C", border: "1px solid #1C1C30", padding: "16px", margin: "0 0 24px 0" }}>
        <p style={{ fontSize: "10px", fontFamily: "monospace", color: "#8888AA", margin: "0 0 8px 0" }}>
          // PRE-WRITTEN TWEET
        </p>
        <p style={{ fontSize: "14px", fontFamily: "monospace", color: "#F0F0FF", margin: 0, whiteSpace: "pre-wrap" }}>
          {tweetText}
        </p>
      </div>

      <EmailCta href={shareUrl} label="SHARE ON X" />
      
      <p style={{ fontSize: "14px", color: "#8888AA", marginTop: "16px", textAlign: "center" as const }}>
        Or view your project directly on BuildOrDie: <a href={projectUrl} style={{ color: "#FF4D00", textDecoration: "none" }}>View Project</a>
      </p>
    </EmailLayout>
  );
}

export default LaunchedEmail;
