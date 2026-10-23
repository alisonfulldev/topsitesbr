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
    <section className="border-t border-black/10 bg-white px-4 py-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className={`grid gap-10 ${visible.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {visible.map(({ heading, links }) => (
            <div key={heading}>
              <h2 className="mb-5 text-base font-semibold text-black/80">{heading}</h2>
              <ul className="flex flex-wrap gap-x-5 gap-y-3">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-black/55 underline decoration-[#FDD900] decoration-2 underline-offset-4 hover:text-black hover:decoration-black"
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
