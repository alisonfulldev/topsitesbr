import Link from 'next/link'

interface RelatedLink {
  label: string
  href: string
}

interface RelatedGroup {
  heading: string
  links: RelatedLink[]
}

export function RelatedLinksSection({ groups }: { groups: RelatedGroup[] }) {
  const visible = groups.filter((g) => g.links.length > 0)
  if (visible.length === 0) return null
  return (
    <section className="border-t border-white/10 bg-[#101010] px-4 py-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className={`grid gap-10 ${visible.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {visible.map(({ heading, links }) => (
            <div key={heading}>
              <h2 className="mb-5 text-base font-semibold text-white/80">{heading}</h2>
              <ul className="flex flex-wrap gap-x-5 gap-y-3">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/55 underline decoration-white/20 underline-offset-4 hover:text-yellow-400 hover:decoration-yellow-400/50"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
