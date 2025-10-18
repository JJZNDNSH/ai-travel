'use client'

import { MapPin, Clock } from 'lucide-react'
import NavigationButton from './NavigationButton'

interface ActivityCardProps {
  activity: {
    time: string
    activity: string
    location: string
    estimatedCost: number
    notes?: string
  }
  day: number
}

export default function ActivityCard({ activity, day }: ActivityCardProps) {

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          <span>{activity.time}</span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-indigo-600">
            ¥{activity.estimatedCost.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">预估费用</p>
        </div>
      </div>

      <h4 className="text-lg font-medium text-gray-900 mb-2">
        {activity.activity}
      </h4>

      <div className="flex items-center text-gray-600 mb-3">
        <MapPin className="h-4 w-4 mr-1" />
        <span className="text-sm">{activity.location}</span>
      </div>

      {activity.notes && (
        <p className="text-sm text-gray-600 mb-3">{activity.notes}</p>
      )}

      {/* 导航按钮 */}
      <div className="flex items-center space-x-3">
        <NavigationButton 
          location={activity.location}
          activity={activity.activity}
        />
      </div>
    </div>
  )
}
