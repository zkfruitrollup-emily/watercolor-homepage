import { getPhotos } from '@/lib/photos'
import PhotographyClient from './PhotographyClient'

// Always fetch fresh photos — never statically cache this page — so an
// uploaded photo shows up immediately after refresh.
export const dynamic = 'force-dynamic'

export default async function PhotographyPage() {
  const photos = await getPhotos()
  return <PhotographyClient photos={photos} />
}
