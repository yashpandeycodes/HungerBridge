import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Container,
} from '@react-email/components';

interface VerificationEmailProps {
  name: string;
  otp: string;
}

export const VerificationEmail = ({ name, otp }: VerificationEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here&apos;s your verification code: {otp}</Preview>
      <Container style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
        <Section style={{ background: '#f3f4f6', borderRadius: '8px', padding: '20px' }}>
          <Row>
            <Heading as="h2" style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0' }}>
              Hello {name},
            </Heading>
          </Row>
          <Row>
            <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#4b5563', margin: '0 0 12px 0' }}>
              Thank you for registering. Please use the following verification code to complete your registration:
            </Text>
          </Row>
          <Row>
            <Text
              style={{
                fontSize: '32px',
                fontWeight: '700',
                textAlign: 'center',
                letterSpacing: '4px',
                margin: '20px 0',
                color: '#1e40af',
                fontFamily: 'monospace',
              }}
            >
              {otp}
            </Text>
          </Row>
          <Row>
            <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#4b5563', margin: '16px 0 0 0' }}>
              If you did not request this code, please ignore this email.
            </Text>
          </Row>
        </Section>
      </Container>
    </Html>
  );
};
