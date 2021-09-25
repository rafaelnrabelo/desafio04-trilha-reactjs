import Link from 'next/link';

import styles from './header.module.scss';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps): JSX.Element {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        <Link href="/">
          <a>
            <img src="/Logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </div>
  );
}
