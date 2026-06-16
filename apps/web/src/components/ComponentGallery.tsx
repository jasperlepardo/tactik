"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  FormField,
  Icon,
  Link,
  Text,
  TextField,
  alertIntents,
  badgeIntents,
  badgeSizes,
  badgeStyles,
  buttonIntents,
  buttonSizes,
  buttonStyles,
  linkTones,
  textVariants,
  type TextTone,
} from "@jasperlepardo/base-design-system";
import { ThemeToggle } from "./ThemeToggle";

const CheckIcon = ({ size }: { size?: number }) => (
  <Icon label="check" size={size}>
    <path
      d="M20 6 9 17l-5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="raised" className="mb-6">
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-5">{children}</div>
      </Card.Body>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <div className="mt-1 flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const textTones: TextTone[] = [
  "default",
  "heading",
  "muted",
  "primary",
  "danger",
  "success",
];

export function ComponentGallery() {
  return (
    <div className="bg-canvas text-body min-h-screen">
      <header className="border-line flex items-center justify-between border-b px-6 py-4">
        <div>
          <Text variant="h2" tone="heading">
            Tactik — Component Gallery
          </Text>
          <Text variant="small" tone="muted">
            @jasperlepardo/base-design-system · toggle theme to test light/dark →
          </Text>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* BUTTONS — every style × intent, plus sizes, icons, states */}
        <Section title="Button">
          {buttonStyles.map((variant) => (
            <Row key={variant} label={`variant="${variant}"`}>
              {buttonIntents.map((intent) => (
                <Button key={intent} variant={variant} intent={intent}>
                  {intent}
                </Button>
              ))}
            </Row>
          ))}
          <Row label="sizes">
            {buttonSizes.map((size) => (
              <Button key={size} size={size}>
                size {size}
              </Button>
            ))}
          </Row>
          <Row label="with icons + disabled">
            <Button leadingIcon={<CheckIcon />}>Leading</Button>
            <Button trailingIcon={<CheckIcon />}>Trailing</Button>
            <Button disabled>Disabled</Button>
          </Row>
        </Section>

        {/* BADGES — intents × styles, plus sizes */}
        <Section title="Badge">
          {badgeStyles.map((variant) => (
            <Row key={variant} label={`variant="${variant}"`}>
              {badgeIntents.map((intent) => (
                <Badge key={intent} variant={variant} intent={intent}>
                  {intent}
                </Badge>
              ))}
            </Row>
          ))}
          <Row label="sizes">
            {badgeSizes.map((size) => (
              <Badge key={size} size={size}>
                size {size}
              </Badge>
            ))}
          </Row>
        </Section>

        {/* TEXT — variants, tones, weights */}
        <Section title="Text">
          <Row label="variants">
            <div className="flex flex-col gap-1">
              {textVariants.map((variant) => (
                <Text key={variant} variant={variant}>
                  {variant} — The quick brown fox
                </Text>
              ))}
            </div>
          </Row>
          <Row label="tones">
            {textTones.map((tone) => (
              <Text key={tone} tone={tone}>
                {tone}
              </Text>
            ))}
          </Row>
          <Row label="weights">
            <Text weight="regular">regular</Text>
            <Text weight="medium">medium</Text>
            <Text weight="semibold">semibold</Text>
            <Text weight="bold">bold</Text>
          </Row>
        </Section>

        {/* LINKS */}
        <Section title="Link">
          <Row label="tones">
            {linkTones.map((tone) => (
              <Link key={tone} href="#" tone={tone}>
                {tone} link
              </Link>
            ))}
          </Row>
          <Row label="underline">
            <Link href="#" underline="hover">
              underline on hover
            </Link>
            <Link href="#" underline="always">
              underline always
            </Link>
          </Row>
        </Section>

        {/* ALERTS — every intent */}
        <Section title="Alert">
          {alertIntents.map((intent) => (
            <Alert
              key={intent}
              intent={intent}
              title={`${intent} alert`}
              icon={<CheckIcon size={18} />}
            >
              This is a {intent} message to verify the {intent} intent styling.
            </Alert>
          ))}
        </Section>

        {/* FORM — FormField (label/hint/error), TextField sizes & states */}
        <Section title="Form fields">
          <FormField label="Email" hint="We'll never share it." required>
            {(props) => <TextField type="email" placeholder="you@tactik.ai" {...props} />}
          </FormField>
          <FormField label="Account name" error="This field is required.">
            {(props) => <TextField placeholder="Acme Inc." {...props} />}
          </FormField>
          <Row label="TextField sizes">
            <TextField size="sm" placeholder="sm" />
            <TextField size="md" placeholder="md" />
            <TextField size="lg" placeholder="lg" />
          </Row>
          <Row label="invalid">
            <TextField invalid placeholder="invalid" />
          </Row>
        </Section>

        {/* ICON */}
        <Section title="Icon">
          <Row label="sizes (inherits currentColor)">
            <CheckIcon size={16} />
            <CheckIcon size={24} />
            <CheckIcon size={32} />
            <Text tone="primary">
              <CheckIcon size={24} />
            </Text>
          </Row>
        </Section>

        {/* CARD variants */}
        <Section title="Card variants">
          <div className="flex flex-wrap gap-4">
            <Card variant="outline" className="w-56">
              <Card.Header>
                <Card.Title>Outline</Card.Title>
              </Card.Header>
              <Card.Body>
                <Text variant="small" tone="muted">
                  Flat surface with a border.
                </Text>
              </Card.Body>
              <Card.Footer>
                <Button size={buttonSizes[0]}>Action</Button>
              </Card.Footer>
            </Card>
            <Card variant="raised" className="w-56">
              <Card.Header>
                <Card.Title>Raised</Card.Title>
              </Card.Header>
              <Card.Body>
                <Text variant="small" tone="muted">
                  Elevated surface with a shadow.
                </Text>
              </Card.Body>
              <Card.Footer>
                <Button size={buttonSizes[0]}>Action</Button>
              </Card.Footer>
            </Card>
          </div>
        </Section>
      </main>
    </div>
  );
}
