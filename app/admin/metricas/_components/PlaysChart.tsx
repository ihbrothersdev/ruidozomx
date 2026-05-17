'use client'

import { Card, CardContent } from '@/app/components/ui/card'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailyPoint } from '../_lib/aggregations'

function fmtShort(iso: string): string {
  // 2026-05-17 → "17 may"
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function PlaysChart({ data }: { data: DailyPoint[] }) {
  const totalPlays = data.reduce((acc, p) => acc + p.plays, 0)
  const totalCompletes = data.reduce((acc, p) => acc + p.completes, 0)
  const totalSessions = data.reduce((acc, p) => acc + p.sessions, 0)

  if (totalPlays + totalCompletes + totalSessions === 0) {
    return (
      <Card className='border-dashed border-white/10 bg-transparent py-10'>
        <CardContent className='font-pt-mono text-center text-xs text-white/30'>
          Sin eventos en el rango seleccionado.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='gap-0 overflow-hidden border-white/10 bg-white/2 py-0'>
      <CardContent className='p-4'>
        <div className='mb-3 flex flex-wrap items-baseline gap-x-6 gap-y-1'>
          <Legend
            color='#f87171'
            label='Plays'
            value={totalPlays}
          />
          <Legend
            color='#34d399'
            label='Completes'
            value={totalCompletes}
          />
          <Legend
            color='#60a5fa'
            label='Sesiones'
            value={totalSessions}
          />
        </div>
        <div className='h-48 w-full'>
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id='plays-grad'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='#f87171'
                    stopOpacity={0.5}
                  />
                  <stop
                    offset='95%'
                    stopColor='#f87171'
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id='completes-grad'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='#34d399'
                    stopOpacity={0.4}
                  />
                  <stop
                    offset='95%'
                    stopColor='#34d399'
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id='sessions-grad'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='#60a5fa'
                    stopOpacity={0.4}
                  />
                  <stop
                    offset='95%'
                    stopColor='#60a5fa'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(255,255,255,0.05)'
                vertical={false}
              />
              <XAxis
                dataKey='date'
                tickFormatter={fmtShort}
                stroke='rgba(255,255,255,0.3)'
                tick={{ fontSize: 10, fontFamily: 'var(--font-pt-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke='rgba(255,255,255,0.3)'
                tick={{ fontSize: 10, fontFamily: 'var(--font-pt-mono)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  fontFamily: 'var(--font-pt-mono)',
                  fontSize: 11
                }}
                labelStyle={{ color: 'white', marginBottom: 4 }}
                labelFormatter={iso => fmtShort(String(iso))}
                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Area
                type='monotone'
                dataKey='sessions'
                stroke='#60a5fa'
                strokeWidth={1.5}
                fill='url(#sessions-grad)'
                name='Sesiones'
              />
              <Area
                type='monotone'
                dataKey='completes'
                stroke='#34d399'
                strokeWidth={1.5}
                fill='url(#completes-grad)'
                name='Completes'
              />
              <Area
                type='monotone'
                dataKey='plays'
                stroke='#f87171'
                strokeWidth={2}
                fill='url(#plays-grad)'
                name='Plays'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className='flex items-center gap-1.5'>
      <span
        className='h-2 w-2 rounded-full'
        style={{ background: color }}
      />
      <span className='font-pt-mono text-[10px] tracking-widest text-white/40 uppercase'>{label}</span>
      <span className='font-pt-mono text-xs font-bold text-white'>{value.toLocaleString('es-MX')}</span>
    </div>
  )
}
