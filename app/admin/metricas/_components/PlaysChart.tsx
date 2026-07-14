'use client'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/app/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { EmptyState, Paper } from '../../_components/kit'
import type { DailyPoint } from '../_lib/aggregations'

function fmtShort(iso: string): string {
  // 2026-05-17 → "17 may"
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

const chartConfig = {
  plays: {
    label: 'Plays',
    color: '#c7352e'
  },
  completes: {
    label: 'Completes',
    color: '#567f24'
  },
  sessions: {
    label: 'Sesiones',
    color: '#1c7f9e'
  }
} satisfies ChartConfig

export function PlaysChart({ data }: { data: DailyPoint[] }) {
  const totals = data.reduce(
    (acc, p) => {
      acc.plays += p.plays
      acc.completes += p.completes
      acc.sessions += p.sessions
      return acc
    },
    { plays: 0, completes: 0, sessions: 0 }
  )

  if (totals.plays + totals.completes + totals.sessions === 0) {
    return <EmptyState>Sin eventos en el rango seleccionado.</EmptyState>
  }

  return (
    <Paper className='overflow-hidden p-4'>
      <div>
        <div className='mb-3 flex flex-wrap items-baseline gap-x-6 gap-y-1'>
          <TotalChip
            color={chartConfig.plays.color}
            label='Plays'
            value={totals.plays}
          />
          <TotalChip
            color={chartConfig.completes.color}
            label='Completes'
            value={totals.completes}
          />
          <TotalChip
            color={chartConfig.sessions.color}
            label='Sesiones'
            value={totals.sessions}
          />
        </div>

        <ChartContainer
          config={chartConfig}
          className='h-48 w-full'
        >
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id='fill-plays'
                x1='0'
                y1='0'
                x2='0'
                y2='1'
              >
                <stop
                  offset='5%'
                  stopColor='var(--color-plays)'
                  stopOpacity={0.5}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-plays)'
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id='fill-completes'
                x1='0'
                y1='0'
                x2='0'
                y2='1'
              >
                <stop
                  offset='5%'
                  stopColor='var(--color-completes)'
                  stopOpacity={0.4}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-completes)'
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id='fill-sessions'
                x1='0'
                y1='0'
                x2='0'
                y2='1'
              >
                <stop
                  offset='5%'
                  stopColor='var(--color-sessions)'
                  stopOpacity={0.4}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-sessions)'
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='rgba(23,19,13,0.12)'
              vertical={false}
            />
            <XAxis
              dataKey='date'
              tickFormatter={fmtShort}
              stroke='rgba(23,19,13,0.3)'
              tick={{ fontSize: 10, fontFamily: 'var(--font-pt-mono)', fill: 'rgba(23,19,13,0.55)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke='rgba(23,19,13,0.3)'
              tick={{ fontSize: 10, fontFamily: 'var(--font-pt-mono)', fill: 'rgba(23,19,13,0.55)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ stroke: 'rgba(23,19,13,0.2)' }}
              content={
                <ChartTooltipContent
                  indicator='dot'
                  labelFormatter={iso => fmtShort(String(iso))}
                  className='border-admin-ink !bg-admin-surface text-admin-ink'
                />
              }
            />
            <Area
              dataKey='sessions'
              type='monotone'
              stroke='var(--color-sessions)'
              strokeWidth={1.5}
              fill='url(#fill-sessions)'
            />
            <Area
              dataKey='completes'
              type='monotone'
              stroke='var(--color-completes)'
              strokeWidth={1.5}
              fill='url(#fill-completes)'
            />
            <Area
              dataKey='plays'
              type='monotone'
              stroke='var(--color-plays)'
              strokeWidth={2}
              fill='url(#fill-plays)'
            />
            <ChartLegend content={<ChartLegendContent className='text-admin-ink-soft' />} />
          </AreaChart>
        </ChartContainer>
      </div>
    </Paper>
  )
}

function TotalChip({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className='flex items-center gap-1.5'>
      <span
        className='h-2 w-2 rounded-full'
        style={{ background: color }}
      />
      <span className='font-pt-mono text-admin-ink-soft text-[10px] tracking-widest uppercase'>{label}</span>
      <span className='font-pt-mono text-admin-ink text-xs font-bold'>{value.toLocaleString('es-MX')}</span>
    </div>
  )
}
