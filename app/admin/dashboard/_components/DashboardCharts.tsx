'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type PlanData = { name: string; count: number }
type FunnelItem = { name: string; value: number }

export function DashboardCharts({
  clientsPerPlan,
  funnelData,
}: {
  clientsPerPlan: PlanData[]
  funnelData: FunnelItem[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Clientes por Plano</h3>
        {clientsPerPlan.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">Nenhuma assinatura ativa</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={clientsPerPlan}
              margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e5e7eb' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [`${v} cliente${v !== 1 ? 's' : ''}`, 'Clientes']}
              />
              <Bar dataKey="count" name="Clientes" fill="#0D0B1F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Funil de Clientes</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={funnelData}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={92}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e5e7eb' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v} cliente${v !== 1 ? 's' : ''}`, 'Total']}
            />
            <Bar dataKey="value" name="Clientes" fill="#FFD100" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-1">
          {funnelData.map((item, i) => {
            const pct =
              i === 0 || funnelData[0].value === 0
                ? 100
                : Math.round((item.value / funnelData[0].value) * 100)
            return (
              <div key={item.name} className="flex items-center justify-between text-xs text-gray-500">
                <span>{item.name}</span>
                <span className="font-medium text-gray-700">
                  {item.value} ({pct}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
