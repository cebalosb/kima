import { useEffect, useState } from 'react'
import { FacebookLogo, InstagramLogo } from '@phosphor-icons/react'

const CONGO_TIMEZONE = 'Africa/Brazzaville'

function brazzavilleTime() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CONGO_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}

export function Footer() {
  const [time, setTime] = useState(brazzavilleTime)

  useEffect(() => {
    const id = setInterval(() => setTime(brazzavilleTime()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
        <span className="font-agency-mono text-[0.625rem] text-foreground-muted">
          Brazzaville [ {time} ]
        </span>

        <div className="flex items-center gap-5">
          <span className="font-agency-mono text-[0.625rem] text-foreground-muted">Follow us</span>
          <a
            href="#"
            className="font-agency-mono flex items-center gap-1.5 text-[0.625rem] text-foreground transition-colors duration-150 hover:text-accent"
          >
            <InstagramLogo size={13} weight="bold" />
            Instagram
          </a>
          <a
            href="#"
            className="font-agency-mono flex items-center gap-1.5 text-[0.625rem] text-foreground transition-colors duration-150 hover:text-accent"
          >
            <FacebookLogo size={13} weight="bold" />
            Facebook
          </a>
        </div>
      </div>
    </footer>
  )
}
