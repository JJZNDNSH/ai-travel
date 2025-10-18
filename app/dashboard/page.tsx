import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, MapPin, Calendar, Users, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 获取用户的旅行计划
  const { data: plans } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 获取总支出
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .in('plan_id', plans?.map(p => p.id) || [])

  const totalSpent = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
  const totalBudget = plans?.reduce((sum, plan) => sum + plan.budget, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">AI 旅行规划</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{user.email}</span>
              <form action="/auth/signout" method="post">
                <button 
                  type="submit"
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">旅行计划</p>
                <p className="text-2xl font-bold text-gray-900">{plans?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总预算</p>
                <p className="text-2xl font-bold text-gray-900">¥{totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已花费</p>
                <p className="text-2xl font-bold text-gray-900">¥{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Link
            href="/planner"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建新旅行计划
          </Link>
        </div>

        {/* Plans List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">我的旅行计划</h2>
          </div>
          
          {plans && plans.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {plans.map((plan) => (
                <div key={plan.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{plan.title}</h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {plan.destination}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {plan.travelers} 人
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ¥{plan.budget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/plans/${plan.id}`}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        查看详情
                      </Link>
                      <Link
                        href={`/expenses/${plan.id}`}
                        className="text-green-600 hover:text-green-500 text-sm font-medium"
                      >
                        费用管理
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">还没有旅行计划</h3>
              <p className="mt-1 text-sm text-gray-500">开始创建您的第一个旅行计划吧！</p>
              <div className="mt-6">
                <Link
                  href="/planner"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建计划
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

