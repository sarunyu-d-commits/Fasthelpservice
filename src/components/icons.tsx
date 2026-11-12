import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Outline({
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12" />
      <path d="M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </Outline>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.75" />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.75" />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.75" />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.75" />
    </Outline>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M6.75 3v2.25M17.25 3v2.25" />
      <path d="M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </Outline>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      <path d="M4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </Outline>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </Outline>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </Outline>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M4.5 12.75l6 6 9-13.5" />
    </Outline>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
    </Outline>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </Outline>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Outline>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </Outline>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </Outline>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M12 4.5v15m7.5-7.5h-15" />
    </Outline>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </Outline>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </Outline>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M21 21l-4.35-4.35m1.35-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
    </Outline>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
    </Outline>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </Outline>
  );
}

export function BadgeCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function QuoteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9.486 5.25c-3.053 1.304-5.236 4.29-5.236 7.86 0 3.06 1.79 5.14 4.32 5.14 2.24 0 3.86-1.62 3.86-3.78 0-2.06-1.44-3.56-3.38-3.56-.34 0-.74.05-1.02.16.34-1.72 1.72-3.5 3.4-4.5l-1.944-1.32zm9.19 0c-3.05 1.304-5.236 4.29-5.236 7.86 0 3.06 1.79 5.14 4.32 5.14 2.24 0 3.86-1.62 3.86-3.78 0-2.06-1.44-3.56-3.38-3.56-.34 0-.74.05-1.02.16.34-1.72 1.72-3.5 3.4-4.5l-1.944-1.32z" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </Outline>
  );
}

export function CalendarCheckIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M6.75 3v2.25M17.25 3v2.25" />
      <path d="M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      <path d="M9 14.25l2 2 4-4" />
    </Outline>
  );
}

export function SnowflakeIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M12 2.5v19M4 7.25l16 9.5M20 7.25l-16 9.5" />
      <path d="M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5" />
      <path d="M4.6 11.2l3.3.6-.6-3.3M19.4 12.8l-3.3-.6.6 3.3M19.4 11.2l-3.3.6.6-3.3M4.6 12.8l3.3-.6-.6 3.3" />
    </Outline>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M4 16.5V13l2.1-5.1A1.5 1.5 0 017.5 7h9a1.5 1.5 0 011.4.9L20 13v3.5" />
      <path d="M3.5 13h17" />
      <path d="M5 16.5h14" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </Outline>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M20 4c-8 0-14 4.2-14 11a5 5 0 005 5c6.8 0 9-7 9-16z" />
      <path d="M4 20c2.2-4.2 5.4-7.2 10-9" />
    </Outline>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M2.75 7.25h10.5v9H2.75z" />
      <path d="M13.25 10.25h4l3 3v3h-7" />
      <circle cx="6.75" cy="17.75" r="1.6" />
      <circle cx="16.75" cy="17.75" r="1.6" />
    </Outline>
  );
}

export function ToolsIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
      <path d="M6.75 18.75l.008.008" />
    </Outline>
  );
}
