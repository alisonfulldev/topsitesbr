import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'

export default function ClientesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <Skeleton className="h-9 w-72 rounded-lg" />

      <SkeletonTable rows={6} cols={8} />
    </div>
  )
}
