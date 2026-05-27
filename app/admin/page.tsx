// app/admin/page.tsx
// Private admin dashboard — requires API key for access

import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 300 // refresh every 5 minutes

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const params = await searchParams
  const adminKey = process.env.ADMIN_DASHBOARD_KEY

  // Check API key
  if (!adminKey || params.key !== adminKey) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">401 Unauthorized</h1>
          <p className="text-gray-400 mb-4">Access denied. Invalid or missing API key.</p>
          <p className="text-gray-500 text-sm">Usage: /admin?key=your-secret-key</p>
        </div>
      </div>
    )
  }

  // Get site-wide stats
  let siteStats = null
  try {
    const result = await supabaseAdmin.rpc('get_site_stats')
    siteStats = result.data
  } catch (error) {
    siteStats = null
  }

  // Top stacks by views last 30 days
  let topStacks = null
  try {
    const result = await supabaseAdmin
      .from('professions')
      .select('name, slug, user_count, category')
      .eq('status', 'live')
      .order('user_count', { ascending: false })
      .limit(20)
    topStacks = result.data
  } catch (error) {
    topStacks = null
  }

  // Views by day last 14 days
  let viewsByDay = null
  try {
    const result = await supabaseAdmin
      .from('daily_view_stats')
      .select('date, total_views, unique_visitors, profession_slug')
      .gte('date', new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0])
      .order('date', { ascending: false })
    viewsByDay = result.data
  } catch (error) {
    viewsByDay = null
  }

  // Aggregate views per day across all stacks
  const dailyTotals: Record<string, { views: number; unique: number }> = {}
  for (const row of (viewsByDay || [])) {
    if (!dailyTotals[row.date]) dailyTotals[row.date] = { views: 0, unique: 0 }
    dailyTotals[row.date].views  += row.total_views
    dailyTotals[row.date].unique += row.unique_visitors
  }

  // Top referrers
  let referrers = null
  try {
    const result = await supabaseAdmin
      .from('page_views')
      .select('referrer')
      .gte('viewed_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .not('referrer', 'is', null)
    referrers = result.data
  } catch (error) {
    referrers = null
  }

  const referrerCounts: Record<string, number> = {}
  for (const row of (referrers || [])) {
    const r = row.referrer || 'direct'
    referrerCounts[r] = (referrerCounts[r] || 0) + 1
  }
  const topReferrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Top tool clicks
  let topClicks = null
  try {
    const result = await supabaseAdmin
      .from('tool_clicks')
      .select('tool_id, tools(name)')
      .gte('clicked_at', new Date(Date.now() - 30 * 86400000).toISOString())
    topClicks = result.data
  } catch (error) {
    topClicks = null
  }

  const clickCounts: Record<string, { name: string; count: number }> = {}
  for (const row of (topClicks || [])) {
    const id   = row.tool_id
    const name = (row.tools as any)?.name || id
    if (!clickCounts[id]) clickCounts[id] = { name, count: 0 }
    clickCounts[id].count++
  }
  const topToolClicks = Object.values(clickCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Pending tool submissions
  let submissions = null
  try {
    const result = await supabaseAdmin
      .from('tool_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)
    submissions = result.data
  } catch (error) {
    submissions = null
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl text-white">
            Upgrade<span className="text-accent">Stacks</span> Admin
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time site analytics dashboard</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Live Stacks',       value: siteStats?.total_professions || 0,       color: 'text-accent' },
            { label: 'Tools Listed',       value: siteStats?.total_tools || 0,              color: 'text-blue-400' },
            { label: 'Visitors (30d)',     value: siteStats?.unique_visitors_30d || 0,      color: 'text-green-400' },
            { label: 'Page Views (30d)',   value: siteStats?.total_views_30d || 0,          color: 'text-yellow-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className={`font-display font-extrabold text-3xl ${kpi.color} mb-1`}>
                {Number(kpi.value).toLocaleString('en-IN')}
              </div>
              <div className="text-gray-500 text-sm">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Daily Views Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-display font-bold text-base mb-4">Daily Traffic (Last 14 Days)</h2>
            <div className="space-y-2">
              {Object.entries(dailyTotals)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 14)
                .map(([date, stats]) => {
                  const maxViews = Math.max(...Object.values(dailyTotals).map(s => s.views), 1)
                  const barWidth = Math.round((stats.views / maxViews) * 100)
                  return (
                    <div key={date} className="flex items-center gap-3">
                      <div className="text-gray-500 text-xs w-20 flex-shrink-0">
                        {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-full h-2 relative overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 w-16 text-right">
                        {stats.views.toLocaleString()} views
                      </div>
                    </div>
                  )
                })}
              {Object.keys(dailyTotals).length === 0 && (
                <p className="text-gray-600 text-sm text-center py-4">No data yet — views will appear here as users visit</p>
              )}
            </div>
          </div>

          {/* Top Stacks */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-display font-bold text-base mb-4">Top Stacks by Visitors</h2>
            <div className="space-y-2">
              {(topStacks || []).slice(0, 10).map((stack, i) => (
                <div key={stack.slug} className="flex items-center gap-3">
                  <span className="text-gray-600 text-xs w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{stack.name}</div>
                    <div className="text-xs text-gray-600">{stack.category}</div>
                  </div>
                  <div className="text-accent font-bold text-sm">
                    {stack.user_count.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
              {(!topStacks || topStacks.length === 0) && (
                <p className="text-gray-600 text-sm text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Traffic Sources */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-display font-bold text-base mb-4">Traffic Sources (30d)</h2>
            <div className="space-y-3">
              {topReferrers.length > 0 ? topReferrers.map(([source, count]) => {
                const icons: Record<string, string> = {
                  google: '🔍', direct: '🔗', whatsapp: '💬',
                  instagram: '📸', twitter: '𝕏', linkedin: '💼',
                  youtube: '▶️', facebook: '👥', internal: '↩️', other: '🌐'
                }
                const total = topReferrers.reduce((s, [, c]) => s + c, 0)
                const pct   = Math.round((count / total) * 100)
                return (
                  <div key={source} className="flex items-center gap-2">
                    <span className="text-base">{icons[source] || '🌐'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize text-gray-300">{source}</span>
                        <span className="text-gray-500">{pct}%</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs w-8 text-right">{count}</span>
                  </div>
                )
              }) : (
                <p className="text-gray-600 text-sm text-center py-4">Traffic sources appear here as users arrive</p>
              )}
            </div>
          </div>

          {/* Top Clicked Tools */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-display font-bold text-base mb-4">Most Clicked Tools (30d)</h2>
            <div className="space-y-2">
              {topToolClicks.length > 0 ? topToolClicks.map((tool, i) => (
                <div key={tool.name} className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs w-5">{i + 1}</span>
                  <div className="flex-1 text-sm text-gray-300 truncate">{tool.name}</div>
                  <div className="text-yellow-400 font-bold text-sm">{tool.count}</div>
                </div>
              )) : (
                <p className="text-gray-600 text-sm text-center py-4">Tool clicks appear here as users visit</p>
              )}
            </div>
          </div>

          {/* Pending Submissions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-display font-bold text-base mb-4">
              Pending Submissions
              {submissions && submissions.length > 0 && (
                <span className="ml-2 bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                  {submissions.length}
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {(submissions || []).map(sub => (
                <div key={sub.id} className="border border-gray-800 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-white">{sub.tool_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        For: <span className="text-gray-400">{sub.profession_slug}</span>
                      </div>
                      {sub.reason && (
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{sub.reason}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <a
                      href={`/admin/approve/${sub.id}`}
                      className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded hover:bg-green-800 transition-colors"
                    >
                      Approve
                    </a>
                    <a
                      href={`/admin/reject/${sub.id}`}
                      className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded hover:bg-red-800 transition-colors"
                    >
                      Reject
                    </a>
                  </div>
                </div>
              ))}
              {(!submissions || submissions.length === 0) && (
                <p className="text-gray-600 text-sm text-center py-4">No pending submissions</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer note */}
        <div className="text-center text-gray-700 text-xs mt-8">
          Admin dashboard — refreshes every 5 minutes •
          All counts based on unique visitors (IP-hashed, GDPR compliant)
        </div>

      </div>
    </div>
  )
}
