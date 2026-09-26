import type { SVGProps } from 'react'

type IconName = 'arrow' | 'chevron' | 'check' | 'chat' | 'plus'

const paths: Record<IconName, string> = {
  arrow: 'M7 17 17 7M7 7h10v10',
  chevron: 'm6 9 6 6 6-6',
  check: 'm5 12 4 4L19 6',
  chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 2 1.5-6A8.5 8.5 0 1 1 21 11.5ZM7 10h9M7 14h6',
  plus: 'M12 5v14M5 12h14',
}

export function WhatsAppIcon({ className = 'h-6 w-6 shrink-0' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.47 9.47 0 0 1-4.83-1.32l-.35-.21-3.59.94.96-3.5-.23-.36a9.46 9.46 0 0 1-1.45-5.05c0-5.23 4.26-9.49 9.5-9.49 2.54 0 4.92.99 6.71 2.79a9.43 9.43 0 0 1 2.78 6.71c0 5.23-4.26 9.49-9.49 9.49m8.08-17.57A11.35 11.35 0 0 0 12.05.58C5.75.58.62 5.7.62 12c0 2.01.53 3.98 1.53 5.71L.53 23.42l5.85-1.53a11.4 11.4 0 0 0 5.66 1.44h.01c6.3 0 11.43-5.13 11.43-11.43 0-3.05-1.19-5.92-3.35-8.08" />
    </svg>
  )
}

export function MarketingIcon({ name, className = 'h-4 w-4 shrink-0', ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className} {...props}>
      <path d={paths[name]} />
    </svg>
  )
}
