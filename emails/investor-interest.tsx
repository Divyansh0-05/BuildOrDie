import * as React from "react";
import { EmailLayout, EmailCta } from "./layout";

export function InvestorInterestEmail({
  projectTitle,
  investorName,
  investorEmail,
  builderName,
}: {
  projectTitle: string;
  investorName: string;
  investorEmail: string;
  builderName: string;
}) {
  return (
    <EmailLayout previewText={`Investor interest in ${projectTitle}!`}>
      <h1 style={{ color: "#FF4D00", fontSize: "28px", fontWeight: "900", margin: "0 0 16px 0" }}>
        INVESTOR INTEREST
      </h1>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Hey {builderName},
      </p>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        An investor has expressed interest in your project <strong>{projectTitle}</strong>.
      </p>
      <div style={{ background: "#0E0E1C", border: "1px solid #1C1C30", padding: "16px", margin: "0 0 24px 0" }}>
        <p style={{ fontSize: "14px", margin: "0 0 8px 0", color: "#F0F0FF" }}>
          <strong>Investor:</strong> {investorName}
        </p>
        <p style={{ fontSize: "14px", margin: "0", color: "#F0F0FF" }}>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${investorEmail}`} style={{ color: "#FF4D00", textDecoration: "none" }}>
            {investorEmail}
          </a>
        </p>
      </div>
      <p style={{ fontSize: "16px", color: "#F0F0FF", margin: "0 0 24px 0" }}>
        Reach out to them directly. This is your chance.
      </p>
      <EmailCta href={`mailto:${investorEmail}`} label="REACH OUT VIA EMAIL" />
    </EmailLayout>
  );
}

export default InvestorInterestEmail;
