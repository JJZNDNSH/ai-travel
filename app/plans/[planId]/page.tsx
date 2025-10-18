import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPlanById } from '@/lib/database/plans'
import Link from 'next/link'
import { MapPin, Calendar, Users, DollarSign, Clock, ArrowRight } from 'lucide-react'
import ActivityCard from '@/components/ActivityCard'

interface DayPlan {
  day: number
  date: string
  activities: Array<{
    time: string
    activity: string
    location: string
    estimatedCost: number
    notes?: string
  }>
}

interface TravelPlan {
  id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: number
  travelers: number
  preferences: string
  itinerary: {
    summary: string
    totalEstimatedCost: number
    days: DayPlan[]
    recommendations: {
      accommodation: string[]
      transportation: string[]
      dining: string[]
      activities: string[]
    }
  }
}

export default async function PlanDetailPage(props: { params: Promise<{ planId: string }> }) {
  const { params } = await props
  const { planId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  const plan = await getPlanById(planId, user.id)
  
  if (!plan) {
    notFound()
  }

  const itinerary = plan.itinerary as TravelPlan['itinerary']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回仪表板
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/expenses/${plan.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                费用管理
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Overview */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">行程概览</h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">目的地</p>
                  <p className="text-lg font-bold text-gray-900">{plan.destination}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">行程日期</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">同行人数</p>
                  <p className="text-lg font-bold text-gray-900">{plan.travelers} 人</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">预算</p>
                  <p className="text-lg font-bold text-gray-900">¥{plan.budget.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {plan.preferences && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">旅行偏好</h3>
                <p className="text-gray-900">{plan.preferences}</p>
              </div>
            )}

            {itinerary.summary && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">行程概述</h3>
                <p className="text-gray-900">{itinerary.summary}</p>
              </div>
            )}
          </div>
        </div>


        {/* Daily Itinerary */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">详细行程</h2>
          </div>
          <div className="px-6 py-6">
            {itinerary.days && itinerary.days.length > 0 ? (
              <div className="space-y-8">
                {itinerary.days.map((day, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                        {day.day}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">第 {day.day} 天</h3>
                        <p className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {day.activities.map((activity, activityIndex) => (
                        <ActivityCard
                          key={activityIndex}
                          activity={activity}
                          day={day.day}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无详细行程</h3>
                <p className="mt-1 text-sm text-gray-500">行程正在规划中...</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {itinerary.recommendations && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Accommodation */}
            {itinerary.recommendations.accommodation && itinerary.recommendations.accommodation.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">住宿推荐</h3>
                </div>
                <div className="px-6 py-6">
                  <ul className="space-y-2">
                    {itinerary.recommendations.accommodation.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-indigo-500 mr-2" />
                        <span className="text-gray-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Transportation */}
            {itinerary.recommendations.transportation && itinerary.recommendations.transportation.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">交通推荐</h3>
                </div>
                <div className="px-6 py-6">
                  <ul className="space-y-2">
                    {itinerary.recommendations.transportation.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-indigo-500 mr-2" />
                        <span className="text-gray-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Dining */}
            {itinerary.recommendations.dining && itinerary.recommendations.dining.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">餐饮推荐</h3>
                </div>
                <div className="px-6 py-6">
                  <ul className="space-y-2">
                    {itinerary.recommendations.dining.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-indigo-500 mr-2" />
                        <span className="text-gray-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Activities */}
            {itinerary.recommendations.activities && itinerary.recommendations.activities.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">活动推荐</h3>
                </div>
                <div className="px-6 py-6">
                  <ul className="space-y-2">
                    {itinerary.recommendations.activities.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <ArrowRight className="h-4 w-4 text-indigo-500 mr-2" />
                        <span className="text-gray-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cost Summary */}
        {itinerary.totalEstimatedCost && (
          <div className="bg-white shadow rounded-lg mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">费用预估</h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    ¥{itinerary.totalEstimatedCost.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">预估总费用</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ¥{(plan.budget - itinerary.totalEstimatedCost).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">预算余额</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {((itinerary.totalEstimatedCost / plan.budget) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">预算使用率</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

