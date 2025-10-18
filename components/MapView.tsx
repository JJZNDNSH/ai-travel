'use client'

import { useEffect, useRef, useState } from 'react'

interface MapViewProps {
  destination: string
  itinerary?: any
  className?: string
}

interface MapPoint {
  name: string
  address: string
  lng: number
  lat: number
}

export default function MapView({ destination, itinerary, className = '' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  useEffect(() => {
    // 动态加载高德地图API
    const loadMapScript = () => {
      if (window.AMap) {
        initMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_KEY}&callback=initAMap`
      script.async = true
      document.head.appendChild(script)

      // 设置全局回调函数
      window.initAMap = initMap
    }

    loadMapScript()

    return () => {
      if ((window as any).initAMap) {
        delete (window as any).initAMap
      }
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || mapLoaded) return

    try {
      const map = new window.AMap.Map(mapRef.current, {
        zoom: 12,
        center: [116.397428, 39.90923], // 默认北京
        mapStyle: 'amap://styles/normal'
      })

      setMapInstance(map)
      setMapLoaded(true)

      // 根据目的地搜索并设置地图中心
      searchAndCenterMap(map, destination)
    } catch (error) {
      console.error('地图初始化失败:', error)
    }
  }

  const searchAndCenterMap = async (map: any, placeName: string) => {
    try {
      // 使用高德地图地理编码服务
      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder({
          city: '全国'
        })

        geocoder.getLocation(placeName, (status: string, result: any) => {
          if (status === 'complete' && result.geocodes.length > 0) {
            const location = result.geocodes[0].location
            map.setCenter(location)
            map.setZoom(12)

            // 添加目的地标记
            const marker = new window.AMap.Marker({
              position: location,
              title: placeName,
              icon: new window.AMap.Icon({
                size: new window.AMap.Size(32, 32),
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
              })
            })
            map.add(marker)
            setMarkers([marker])
          }
        })
      })
    } catch (error) {
      console.error('地理编码失败:', error)
    }
  }

  // 当行程数据变化时，在地图上添加景点标记
  useEffect(() => {
    if (!mapInstance || !itinerary || !itinerary.days) return

    // 清除之前的标记
    markers.forEach(marker => mapInstance.remove(marker))
    const newMarkers: any[] = []

    // 添加景点标记
    itinerary.days.forEach((day: any) => {
      if (day.activities) {
        day.activities.forEach((activity: any) => {
          if (activity.location && activity.location !== destination) {
            // 搜索景点位置
            window.AMap.plugin('AMap.Geocoder', () => {
              const geocoder = new window.AMap.Geocoder({
                city: destination
              })

              geocoder.getLocation(activity.location, (status: string, result: any) => {
                if (status === 'complete' && result.geocodes.length > 0) {
                  const location = result.geocodes[0].location
                  
                  const marker = new window.AMap.Marker({
                    position: location,
                    title: activity.activity,
                    content: `
                      <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-weight: bold; font-size: 12px;">${activity.activity}</div>
                        <div style="font-size: 10px; color: #666;">${activity.location}</div>
                      </div>
                    `
                  })
                  
                  mapInstance.add(marker)
                  newMarkers.push(marker)
                }
              })
            })
          }
        })
      }
    })

    setMarkers(newMarkers)
  }, [mapInstance, itinerary, destination])

  if (!mapLoaded) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">地图加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
    </div>
  )
}

// 声明全局变量类型
declare global {
  interface Window {
    AMap: any
    initAMap: () => void
  }
}
