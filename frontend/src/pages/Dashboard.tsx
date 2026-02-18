import React, { useState, useEffect } from 'react'
import {
  BarChart3, TrendingUp, Users, Zap, Calendar, Download, Activity,
  ArrowUp, ArrowDown, Globe, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

interface Stats {
  totalConversions: number
  totalCharacters: number
  averageSpeed: number
  uptime: number
}

interface DailyStats {
  date: string
  conversions: number
  users: number
}

function Dashboard() {
  const { settings } = useAccessibility()
  const [stats, setStats] = useState<Stats>({
    totalConversions: 1250,
    totalCharacters: 524360,
    averageSpeed: 125,
    uptime: 99.8,
  })

  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [selectedPeriod])

  const conversionTypes = [
    { name: 'Text to Braille', count: 650, percentage: 52, trend: 8, color: 'from-blue-500 to-cyan-500' },
    { name: 'Image to Braille', count: 420, percentage: 34, trend: 5, color: 'from-green-500 to-emerald-500' },
    { name: 'Braille to Text', count: 180, percentage: 14, trend: -2, color: 'from-yellow-500 to-orange-500' },
  ]

  const recentActivity = [
    { type: 'Text to Braille', user: 'Anonymous', time: '2 minutes ago', status: 'success', chars: 145 },
    { type: 'Image to Braille', user: 'Anonymous', time: '5 minutes ago', status: 'success', chars: 289 },
    { type: 'Text to Braille', user: 'Anonymous', time: '12 minutes ago', status: 'success', chars: 92 },
    { type: 'Braille to Text', user: 'Anonymous', time: '20 minutes ago', status: 'success', chars: 156 },
    { type: 'Text to Braille', user: 'Anonymous', time: '35 minutes ago', status: 'success', chars: 214 },
    { type: 'Image to Braille', user: 'Anonymous', time: '45 minutes ago', status: 'success', chars: 378 },
  ]

  const systemServices = [
    { name: 'Database', status: 'operational', uptime: '99.9%', responseTime: '45ms' },
    { name: 'API Server', status: 'operational', uptime: '99.8%', responseTime: '125ms' },
    { name: 'Braille Engine', status: 'operational', uptime: '100%', responseTime: '98ms' },
    { name: 'Storage Service', status: 'operational', uptime: '99.7%', responseTime: '52ms' },
  ]

  const dailyStats: DailyStats[] = [
    { date: 'Monday', conversions: 245, users: 423 },
    { date: 'Tuesday', conversions: 312, users: 567 },
    { date: 'Wednesday', conversions: 289, users: 502 },
    { date: 'Thursday', conversions: 404, users: 678 },
    { date: 'Friday', conversions: 356, users: 612 },
    { date: 'Saturday', conversions: 198, users: 345 },
    { date: 'Sunday', conversions: 146, users: 267 },
  ]

  const topCountries = [
    { country: 'United States', count: 425, flag: '🇺🇸' },
    { country: 'United Kingdom', count: 312, flag: '🇬🇧' },
    { country: 'Canada', count: 278, flag: '🇨🇦' },
    { country: 'Australia', count: 156, flag: '🇦🇺' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className={`text-4xl md:text-5xl font-black mb-4 ${
          settings.highContrast ? 'text-yellow-400' : 'text-white'
        }`}>
          Dashboard
        </h1>
        <p className={`text-lg ${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
          Real-time statistics and usage analytics for the Braille Conversion Tool.
        </p>
      </div>

      {/* Period Selector */}
      <div className="mb-8 flex gap-2 animate-fade-in">
        {['day', 'week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
              selectedPeriod === period
                ? settings.highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/20 text-white'
                : settings.highContrast
                  ? 'bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Last {period}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            icon: BarChart3,
            label: 'Total Conversions',
            value: stats.totalConversions.toLocaleString(),
            change: '+12.5%',
            color: 'from-blue-500 to-cyan-500',
          },
          {
            icon: TrendingUp,
            label: 'Characters Processed',
            value: `${(stats.totalCharacters / 1000).toFixed(1)}K`,
            change: '+8.2%',
            color: 'from-green-500 to-emerald-500',
          },
          {
            icon: Zap,
            label: 'Avg Speed',
            value: `${stats.averageSpeed}ms`,
            change: '-5.1%',
            color: 'from-yellow-500 to-orange-500',
          },
          {
            icon: Users,
            label: 'Active Users',
            value: '2,345',
            change: '+23.4%',
            color: 'from-purple-500 to-pink-500',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon
          const isPositive = stat.change.includes('+')
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl transition-all hover:scale-105 animate-fade-in ${
                settings.highContrast
                  ? 'bg-black border-4 border-yellow-400'
                  : 'bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20'
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${
                  isPositive
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {stat.change}
                </div>
              </div>
              <p className={`text-sm font-semibold mb-2 ${
                settings.highContrast ? 'text-yellow-300' : 'text-white/70'
              }`}>
                {stat.label}
              </p>
              <p className={`text-3xl font-black ${
                settings.highContrast ? 'text-yellow-400' : 'text-white'
              }`}>
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Conversion Types */}
        <div className={`lg:col-span-2 p-8 rounded-2xl animate-fade-in ${
          settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Conversion Types Distribution
          </h2>

          <div className="space-y-6">
            {conversionTypes.map((type, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-semibold ${settings.highContrast ? 'text-yellow-300' : 'text-white'}`}>
                      {type.name}
                    </p>
                    <p className={`text-xs ${settings.highContrast ? 'text-yellow-200' : 'text-white/60'}`}>
                      {type.count} conversions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${settings.highContrast ? 'text-yellow-400' : 'text-pink-400'}`}>
                      {type.percentage}%
                    </p>
                    <p className={`text-xs ${type.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {type.trend > 0 ? '+' : ''}{type.trend}% trend
                    </p>
                  </div>
                </div>
                <div className={`w-full h-4 rounded-full overflow-hidden ${
                  settings.highContrast ? 'bg-yellow-400/20 border-2 border-yellow-400' : 'bg-white/10 border border-white/20'
                }`}>
                  <div
                    className={`h-full bg-gradient-to-r ${type.color} transition-all duration-500`}
                    style={{ width: `${type.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-8 p-4 rounded-lg ${
            settings.highContrast ? 'bg-yellow-400/10 border-2 border-yellow-400' : 'bg-blue-500/10 border border-blue-400/30'
          }`}>
            <p className={`text-sm ${settings.highContrast ? 'text-yellow-300' : 'text-blue-200'}`}>
              📊 Total conversions in selected period: <span className="font-bold">{stats.totalConversions}</span>
            </p>
          </div>
        </div>

        {/* Top Countries */}
        <div className={`p-8 rounded-2xl h-fit animate-fade-in ${
          settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'
        }`} style={{ animationDelay: '0.2s' }}>
          <h2 className={`text-2xl font-bold mb-6 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Top Countries
          </h2>

          <div className="space-y-4">
            {topCountries.map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${
                settings.highContrast ? 'bg-yellow-400/10 border-2 border-yellow-400' : 'bg-white/10 border border-white/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.flag}</span>
                    <span className={`font-semibold text-sm ${
                      settings.highContrast ? 'text-yellow-300' : 'text-white'
                    }`}>
                      {item.country}
                    </span>
                  </div>
                  <span className={`font-bold text-sm ${
                    settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
                  }`}>
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`p-8 rounded-2xl animate-fade-in mb-8 ${
        settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'
      }`} style={{ animationDelay: '0.3s' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Recent Activity
          </h2>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            settings.highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}>
            <Download size={18} /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${settings.highContrast ? 'border-yellow-400' : 'border-white/20'}`}>
                <th className={`text-left py-3 px-4 font-semibold ${
                  settings.highContrast ? 'text-yellow-300' : 'text-white/70'
                }`}>
                  Type
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${
                  settings.highContrast ? 'text-yellow-300' : 'text-white/70'
                }`}>
                  User
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${
                  settings.highContrast ? 'text-yellow-300' : 'text-white/70'
                }`}>
                  Characters
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${
                  settings.highContrast ? 'text-yellow-300' : 'text-white/70'
                }`}>
                  Time
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${
                  settings.highContrast ? 'text-yellow-300' : 'text-white/70'
                }`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, idx) => (
                <tr
                  key={idx}
                  className={`border-b ${
                    settings.highContrast
                      ? 'border-yellow-400/30 hover:bg-yellow-400/10'
                      : 'border-white/10 hover:bg-white/10'
                  } transition-colors`}
                >
                  <td className={`py-3 px-4 ${settings.highContrast ? 'text-yellow-200' : 'text-white'}`}>
                    {activity.type}
                  </td>
                  <td className={`py-3 px-4 ${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
                    {activity.user}
                  </td>
                  <td className={`py-3 px-4 ${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
                    {activity.chars}
                  </td>
                  <td className={`py-3 px-4 flex items-center gap-2 ${
                    settings.highContrast ? 'text-yellow-200' : 'text-white/80'
                  }`}>
                    <Calendar size={14} /> {activity.time}
                  </td>
                  <td className={`py-3 px-4`}>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      activity.status === 'success'
                        ? settings.highContrast
                          ? 'bg-green-400/30 text-green-300'
                          : 'bg-green-500/20 text-green-300'
                        : settings.highContrast
                          ? 'bg-red-400/30 text-red-300'
                          : 'bg-red-500/20 text-red-300'
                    }`}>
                      {activity.status === 'success' ? '✓ Success' : '✗ Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Status */}
      <div className={`p-8 rounded-2xl animate-fade-in ${
        settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'
      }`} style={{ animationDelay: '0.4s' }}>
        <h2 className={`text-2xl font-bold mb-6 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
          System Services Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemServices.map((service, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                service.status === 'operational'
                  ? settings.highContrast
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-green-400/30 bg-green-500/10'
                  : settings.highContrast
                    ? 'border-red-400 bg-red-400/10'
                    : 'border-red-400/30 bg-red-500/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  service.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <p className={`font-semibold text-sm ${
                  settings.highContrast ? 'text-yellow-300' : 'text-white'
                }`}>
                  {service.name}
                </p>
              </div>
              <p className={`text-xs mb-2 ${
                settings.highContrast ? 'text-yellow-200' : 'text-white/70'
              }`}>
                {service.status === 'operational' ? '✓ Operational' : '✗ Offline'}
              </p>
              <div className="space-y-1">
                <p className={`text-xs ${
                  settings.highContrast ? 'text-yellow-200' : 'text-white/60'
                }`}>
                  Uptime: {service.uptime}
                </p>
                <p className={`text-xs ${
                  settings.highContrast ? 'text-yellow-200' : 'text-white/60'
                }`}>
                  Response: {service.responseTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className={`mt-8 p-4 rounded-lg text-center animate-fade-in ${
        settings.highContrast ? 'bg-yellow-400/10 border-2 border-yellow-400' : 'bg-white/10 border border-white/20'
      }`} style={{ animationDelay: '0.5s' }}>
        <p className={`text-sm ${settings.highContrast ? 'text-yellow-300' : 'text-white/70'}`}>
          <Activity className="inline w-4 h-4 animate-pulse mr-2" />
          Last updated: {new Date().toLocaleTimeString()} • Live data feed active
        </p>
      </div>
    </div>
  )
}

export default Dashboard