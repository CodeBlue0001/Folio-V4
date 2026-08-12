const EASY_COLOR = '#00b8a3'
const MED_COLOR = '#ffa116'
const HARD_COLOR = '#ef4444'
const TRACK_COLOR_DARK = '#3a3a4e'
const TRACK_COLOR_LIGHT = '#e2e8f0'

const GAP_DEG = 52
const START_ANGLE = 90 + GAP_DEG / 2
const ACTIVE_SPAN = 360 - GAP_DEG
const CX = 70
const CY = 70
const R = 54
const STROKE = 8

export interface LeetcodeStatsProps {
  /** Number of easy problems solved */
  easySolved: number
  /** Total easy problems available */
  easyTotal: number
  /** Number of medium problems solved */
  mediumSolved: number
  /** Total medium problems available */
  mediumTotal: number
  /** Number of hard problems solved */
  hardSolved: number
  /** Total hard problems available */
  hardTotal: number
  /** Number of problems currently being attempted */
  attempting?: number
  /** Toggle dark / light theme */
  dark?: boolean
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToCartesian(cx, cy, r, start)
  const e = polarToCartesian(cx, cy, r, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

interface RingChartProps {
  easySolved: number
  easyTotal: number
  mediumSolved: number
  mediumTotal: number
  hardSolved: number
  hardTotal: number
  dark: boolean
}

function RingChart({ easySolved, easyTotal, mediumSolved, mediumTotal, hardSolved, hardTotal, dark }: RingChartProps) {
  const grandTotal = easyTotal + mediumTotal + hardTotal
  const totalSolved = easySolved + mediumSolved + hardSolved

  const easySpan = (easyTotal / grandTotal) * ACTIVE_SPAN
  const medSpan = (mediumTotal / grandTotal) * ACTIVE_SPAN
  const hardSpan = (hardTotal / grandTotal) * ACTIVE_SPAN

  const SEG_GAP = 2
  const easyStart = START_ANGLE
  const easyEnd = easyStart + easySpan - SEG_GAP
  const medStart = easyStart + easySpan + SEG_GAP
  const medEnd = medStart + medSpan - SEG_GAP * 2
  const hardStart = medStart + medSpan + SEG_GAP
  const hardEnd = hardStart + hardSpan - SEG_GAP

  const easySolvedEnd = easyStart + (easySolved / easyTotal) * (easySpan - SEG_GAP)
  const medSolvedEnd = medStart + (mediumSolved / mediumTotal) * (medSpan - SEG_GAP * 2)
  const hardSolvedEnd = hardStart + (hardSolved / hardTotal) * (hardSpan - SEG_GAP)

  const trackColor = dark ? TRACK_COLOR_DARK : TRACK_COLOR_LIGHT

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width={140} height={140} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Background tracks */}
        <path d={describeArc(CX, CY, R, easyStart, easyEnd)} fill="none" stroke={trackColor} strokeWidth={STROKE} strokeLinecap="round" />
        <path d={describeArc(CX, CY, R, medStart, medEnd)} fill="none" stroke={trackColor} strokeWidth={STROKE} strokeLinecap="round" />
        <path d={describeArc(CX, CY, R, hardStart, hardEnd)} fill="none" stroke={trackColor} strokeWidth={STROKE} strokeLinecap="round" />

        {/* Solved arcs */}
        {easySolved > 0 && (
          <path d={describeArc(CX, CY, R, easyStart, easySolvedEnd)} fill="none" stroke={EASY_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
        )}
        {mediumSolved > 0 && (
          <path d={describeArc(CX, CY, R, medStart, medSolvedEnd)} fill="none" stroke={MED_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
        )}
        {hardSolved > 0 && (
          <path d={describeArc(CX, CY, R, hardStart, hardSolvedEnd)} fill="none" stroke={HARD_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
        )}
      </svg>

      {/* Center text */}
      <div className="flex flex-col items-center justify-center z-10 select-none">
        <div className="flex items-baseline gap-0.5" style={{ lineHeight: 1 }}>
          <span className="font-bold" style={{ fontSize: 26, color: dark ? '#fff' : '#1a202c', letterSpacing: '-0.5px' }}>
            {totalSolved}
          </span>
          <span style={{ fontSize: 12, color: dark ? '#8892a4' : '#718096' }}>/{grandTotal}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <svg width={10} height={10} viewBox="0 0 10 10">
            <polyline points="1.5,5.5 4,8 8.5,2" fill="none" stroke={EASY_COLOR} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 10, color: EASY_COLOR }}>Solved</span>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, solved, total, color, dark }: { label: string; solved: number; total: number; color: string; dark: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg"
      style={{
        background: dark ? '#1e2235' : '#f1f5f9',
        border: `1px solid ${dark ? '#2d3348' : '#e2e8f0'}`,
        padding: '6px 14px',
        minWidth: 90,
        gap: 2,
      }}
    >
      <span className="font-semibold" style={{ fontSize: 12, color }}>{label}</span>
      <span className="font-bold" style={{ fontSize: 13, color: dark ? '#fff' : '#1a202c' }}>
        {solved}
        <span style={{ fontWeight: 400, fontSize: 11, color: dark ? '#6b7280' : '#9ca3af' }}>/{total}</span>
      </span>
    </div>
  )
}

/**
 * LeetcodeStats — drop-in card showing solved problem counts with a segmented ring chart.
 */
export default function LeetcodeStats({
  easySolved,
  easyTotal,
  mediumSolved,
  mediumTotal,
  hardSolved,
  hardTotal,
  attempting = 0,
  dark = true,
}: LeetcodeStatsProps) {
  const cardBg = dark ? '#161929' : '#ffffff'
  const border = dark ? '#2d3348' : '#e2e8f0'
  const subtext = dark ? '#8892a4' : '#64748b'

  return (
    <div
      className="rounded-2xl transition-colors inline-flex w-full justify-center items-center p-5"
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex flex-row items-center gap-6 flex-wrap justify-center w-full">
        {/* Ring */}
        <div className="flex flex-col items-center gap-2">
          <RingChart
            easySolved={easySolved}
            easyTotal={easyTotal}
            mediumSolved={mediumSolved}
            mediumTotal={mediumTotal}
            hardSolved={hardSolved}
            hardTotal={hardTotal}
            dark={dark}
          />
          {attempting > 0 && (
            <span style={{ fontSize: 11, color: subtext }}>{attempting} Attempting</span>
          )}
        </div>

        {/* Stat boxes */}
        <div className="flex flex-col gap-2.5">
          <StatBox label="Easy"  solved={easySolved}  total={easyTotal}   color={EASY_COLOR} dark={dark} />
          <StatBox label="Med."  solved={mediumSolved} total={mediumTotal}  color={MED_COLOR}  dark={dark} />
          <StatBox label="Hard"  solved={hardSolved}  total={hardTotal}   color={HARD_COLOR} dark={dark} />
        </div>
      </div>
    </div>
  )
}
