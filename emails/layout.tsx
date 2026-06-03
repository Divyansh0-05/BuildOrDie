import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

export function EmailLayout({
  previewText,
  children,
}: {
  previewText: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerSectionStyle}>
            <Text style={logoStyle}>
              BuildOr<span style={{ color: "#FF4D00" }}>Die</span>
            </Text>
          </Section>
          
          {/* Content */}
          <Section style={contentSectionStyle}>
            {children}
          </Section>
          
          <Hr style={hrStyle} />
          
          {/* Footer */}
          <Section style={footerSectionStyle}>
            <Text style={footerTextStyle}>
              Build it. Launch it. 4 days. Or get kicked.
            </Text>
            <Text style={footerLinkStyle}>
              <Link href="https://buildordie.com" style={linkStyle}>
                buildordie.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#1A1A2E",
  fontFamily: "Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "32px 16px",
};

const headerSectionStyle = {
  paddingBottom: "24px",
  textAlign: "center" as const,
};

const logoStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#F0F0FF",
  margin: 0,
};

const contentSectionStyle = {
  color: "#F0F0FF",
  lineHeight: "1.6",
};

const hrStyle = {
  borderColor: "#2A2A45",
  margin: "32px 0 24px",
};

const footerSectionStyle = {
  textAlign: "center" as const,
};

const footerTextStyle = {
  color: "#8888AA",
  fontSize: "12px",
  margin: "0 0 8px 0",
};

const footerLinkStyle = {
  margin: 0,
};

const linkStyle = {
  color: "#FF4D00",
  textDecoration: "none",
  fontWeight: "bold",
};

export function EmailCta({ href, label }: { href: string; label: string }) {
  return (
    <div style={{ margin: "24px 0" }}>
      <a
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: "#FF4D00",
          color: "#080810",
          fontWeight: "bold",
          padding: "12px 24px",
          textDecoration: "none",
          fontSize: "14px",
          textAlign: "center" as const,
        }}
      >
        {label}
      </a>
    </div>
  );
}
