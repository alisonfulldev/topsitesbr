import { marketingMetadata } from '@/lib/marketing'
import { serviceContent } from '@/lib/marketing-services'
import { ServicePage } from '@/components/marketing/ServicePage'

const content = serviceContent['landing-page']
export const metadata = marketingMetadata(content.title, content.description, '/' + content.slug)

export default function Page() {
  return <ServicePage content={content} />
}
