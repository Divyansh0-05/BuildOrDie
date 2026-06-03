import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function FeaturedEmail({
  projectTitle,
  projectUrl,
}: {
  projectTitle: string;
  projectUrl: string;
}) {
  return (
    <EmailLayout previewText={`Congrats! ${projectTitle} is featured.`}>
      <h1 style={{ color: "#00D680", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        YOU MADE THE STRIP.
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Your project <strong>{projectTitle}</strong> is organically featured on the homepage.
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Keep the momentum going. Share it, gather more feedback, and keep building.
      </p>
      <EmailCta href={projectUrl} label="VIEW HOMEPAGE" />
    </EmailLayout>
  );
}

export default FeaturedEmail;
