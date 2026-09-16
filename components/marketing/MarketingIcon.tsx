import type { SVGProps } from 'react'

type IconName = 'arrow' | 'chevron' | 'check' | 'chat' | 'plus'

const paths: Record<IconName, string> = {
  arrow: 'M7 17 17 7M7 7h10v10',
  chevron: 'm6 9 6 6 6-6',
  check: 'm5 12 4 4L19 6',
  chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 2 1.5-6A8.5 8.5 0 1 1 21 11.5ZM7 10h9M7 14h6',
  plus: 'M12 5v14M5 12h14',
}

export function MarketingIcon({ name, className = 'h-4 w-4 shrink-0', ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className} {...props}>
      <path d={paths[name]} />
    </svg>
  )
}
