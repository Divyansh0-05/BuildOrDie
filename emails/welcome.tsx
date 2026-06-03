import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function WelcomeEmail() {
  return (
    <EmailLayout previewText="Welcome to BuildOrDie. Now build something.">
      <h1 style={{ color: "#F0F0FF", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        You found it.
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        This is BuildOrDie. You have ideas that have been sitting in your head or notes for months. That ends today.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Here is the rule: you declare your idea publicly. The clock starts immediately. You have exactly 4 days (96 hours) to build and launch it.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Launch on time, or get kicked off the platform. Build fast, reach people, or crash and move on.
      </p>
      <EmailCta href="https://buildordie.com/submit" label="DECLARE YOUR IDEA" />
    </EmailLayout>
  );
}

export default WelcomeEmail;
