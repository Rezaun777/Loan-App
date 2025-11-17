"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { Card } from '@/components/ui/card'

interface AdminChartsProps {
  stats: {
    totalMembers: number
    loanApplied: number
    notYet: number
    transfer: number
    insurance: number
    vip: number
    maintenance: number
    fault: number
    loanPending: number
    loanPass: number
    payPending: number
    payPass: number
    rejected: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function AdminCharts({ stats }: AdminChartsProps) {
  // Data for the loan status pie chart
  const loanStatusData = [
    { name: 'Pending', value: stats.loanPending },
    { name: 'Approved', value: stats.loanPass },
    { name: 'Payment Pending', value: stats.payPending },
    { name: 'Payment Approved', value: stats.payPass },
    { name: 'Rejected', value: stats.rejected },
  ]

  // Data for the levels bar chart
  const levelsData = [
    { name: 'Not Yet', count: stats.notYet },
    { name: 'Transfer', count: stats.transfer },
    { name: 'Insurance', count: stats.insurance },
    { name: 'VIP', count: stats.vip },
    { name: 'Maintenance', count: stats.maintenance },
    { name: 'Fault', count: stats.fault },
  ]

  // Data for the application flow line chart
  const applicationFlowData = [
    { name: 'Applied', count: stats.loanApplied },
    { name: 'Pending', count: stats.loanPending },
    { name: 'Approved', count: stats.loanPass },
    { name: 'Pay Pending', count: stats.payPending },
    { name: 'Pay Approved', count: stats.payPass },
    { name: 'Rejected', count: stats.rejected },
  ]

  // Data for the cumulative metrics area chart
  const cumulativeData = [
    { name: 'Members', value: stats.totalMembers },
    { name: 'Loans', value: stats.loanApplied },
    { name: 'Approved', value: stats.loanPass + stats.payPass },
    { name: 'Pending', value: stats.loanPending + stats.payPending },
    { name: 'Rejected', value: stats.rejected },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Loan Status Pie Chart */}
      <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Loan Status Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={loanStatusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {loanStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Count']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Levels Bar Chart */}
      <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Loan Levels Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={levelsData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Loan Count" fill="#8884d8" animationDuration={1000}>
                {levelsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Application Flow Line Chart */}
      <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Application Flow Progress</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={applicationFlowData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Applications" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cumulative Metrics Area Chart */}
      <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cumulative Metrics Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cumulativeData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                name="Count" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}