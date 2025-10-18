'use client'

import { Navigation } from 'lucide-react'

interface NavigationButtonProps {
  location: string
  activity?: string
  className?: string
}

export default function NavigationButton({ location, activity, className = '' }: NavigationButtonProps) {
  const handleNavigation = async () => {
    try {
      // ✅ 1. 获取用户当前位置
      const fromLocation = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
        if (!navigator.geolocation) {
          resolve(null)
          return
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            })
          },
          (error) => {
            console.warn('无法获取当前位置:', error)
            resolve(null)
          },
          { timeout: 5000 }
        )
      })

      // ✅ 2. 使用高德地理编码 API 获取目标景点的经纬度
      const apiKey = process.env.NEXT_PUBLIC_AMAP_KEY
      console.log(apiKey)
      const geoUrl = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(location)}&key=${apiKey}`

      const geoRes = await fetch(geoUrl)
      const geoData = await geoRes.json()

      if (!geoData.geocodes?.length) {
        throw new Error('未找到目的地位置')
      }

      const [lon, lat] = geoData.geocodes[0].location.split(',')
      const destName = activity ? `${location}·${activity}` : location

      // ✅ 3. 构建导航 URL
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())

      if (isMobile) {
        // 移动端：优先尝试打开高德 App
        let appScheme = `amapuri://route/plan/?dlat=${lat}&dlon=${lon}&dname=${encodeURIComponent(destName)}&dev=0&t=0`

        if (fromLocation) {
          appScheme = `amapuri://route/plan/?slat=${fromLocation.lat}&slon=${fromLocation.lon}&sname=我的位置&dlat=${lat}&dlon=${lon}&dname=${encodeURIComponent(destName)}&dev=0&t=0`
        }

        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = appScheme
        document.body.appendChild(iframe)

        // 如果2秒内没打开App，就回退到网页导航
        setTimeout(() => {
          document.body.removeChild(iframe)
          let webUrl = `https://uri.amap.com/navigation?to=${lon},${lat},${encodeURIComponent(destName)}&mode=car&policy=1`
          if (fromLocation) {
            webUrl = `https://uri.amap.com/navigation?from=${fromLocation.lon},${fromLocation.lat},我的位置&to=${lon},${lat},${encodeURIComponent(destName)}&mode=car&policy=1`
          }
          window.open(webUrl, '_blank')
        }, 2000)
      } else {
        // PC端：直接打开网页版
        let webUrl = `https://uri.amap.com/navigation?to=${lon},${lat},${encodeURIComponent(destName)}&mode=car&policy=1`
        if (fromLocation) {
          webUrl = `https://uri.amap.com/navigation?from=${fromLocation.lon},${fromLocation.lat},我的位置&to=${lon},${lat},${encodeURIComponent(destName)}&mode=car&policy=1`
        }
        window.open(webUrl, '_blank')
      }
    } catch (error) {
      console.error('导航失败:', error)
      alert('导航失败，请重试')
    }
  }

  return (
    <button
      onClick={handleNavigation}
      className={`inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium ${className}`}
      title={`导航到 ${location}`}
    >
      <Navigation className="h-4 w-4 mr-1" />
      导航
    </button>
  )
}
