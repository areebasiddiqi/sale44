'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface AuditScoreChartProps {
  totalScore: number
  parameters: Record<string, any>
}

const COLORS = {
  digitalPresence: '#3B82F6',
  marketVisibility: '#10B981',
  businessOperations: '#F59E0B',
  competitivePositioning: '#EF4444',
  dataInsight: '#8B5CF6',
  compliance: '#06B6D4'
}

export function AuditScoreChart({ totalScore, parameters }: AuditScoreChartProps) {
  // Prepare data for charts
  const pieData = Object.entries(parameters).map(([key, param]) => ({
    name: param.name.replace(/&/g, '&'),
    value: param.weight,
    score: param.score,
    color: COLORS[key as keyof typeof COLORS] || '#6B7280'
  }))

  const barData = Object.entries(parameters).map(([key, param]) => ({
    name: param.name.replace(/&/g, '&').replace(/ /g, '\n'),
    score: param.score,
    weight: param.weight,
    fill: COLORS[key as keyof typeof COLORS] || '#6B7280'
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">Score: {data.score}/100</p>
          <p className="text-sm text-gray-600">Weight: {data.weight}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Circle */}
      <div className="text-center">
        <div className="relative inline-block">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={
                totalScore >= 80 ? '#10B981' :
                totalScore >= 60 ? '#3B82F6' :
                totalScore >= 40 ? '#F59E0B' : '#EF4444'
              }
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${(totalScore / 100) * 351.86} 351.86`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalScore}</div>
              <div className="text-xs text-gray-500">Overall</div>
            </div>
          </div>
        </div>
      </div>

      {/* Parameter Scores Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Parameter Weight Distribution */}
      <div className="h-48">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Parameter Weight Distribution</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: any, props: any) => [
                `${value}% (Score: ${props.payload.score})`,
                props.payload.name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {pieData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded mr-2" 
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
