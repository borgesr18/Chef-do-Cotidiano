import Link from 'next/link';

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function CTAButton({ children, href, onClick, variant = 'primary' }: CTAButtonProps) {
  const className = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
