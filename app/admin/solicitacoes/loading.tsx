import { Skeleton } from '@/components/ui/skeleton'

export default function SolicitacoesLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-7 w-56" />

      {/* Filter row */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-56 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Ticket cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
