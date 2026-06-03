import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function FounderPassEmail() {
  return (
    <EmailLayout previewText="Founder Pass unlocked. Permanent perks activated.">
      <h1 style={{ color: "#FF4D00", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        FOUNDER PASS UNLOCKED
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Welcome to the circle. Your Founder Pass is active permanently.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Here are your new superpowers:
      </p>
      <ul style={{ color: "#F0F0FF", fontSize: "16px", paddingLeft: "20px", margin: "0 0 24px 0" }}>
        <li style={{ marginBottom: "8px" }}><strong>2 active ideas</strong> simultaneously (instead of 1).</li>
        <li style={{ marginBottom: "8px" }}><strong>6-hour automatic grace extension</strong> before entering the WARNED state.</li>
        <li style={{ marginBottom: "8px" }}><strong>Founder Badge</strong> displayed next to your name and projects.</li>
        <li style={{ marginBottom: "8px" }}><strong>Priority position</strong> in the boost slots queue.</li>
      </ul>
      <EmailCta href="https://buildordie.com/submit" label="DECLARE YOUR IDEA" />
    </EmailLayout>
  );
}

export default FounderPassEmail;
