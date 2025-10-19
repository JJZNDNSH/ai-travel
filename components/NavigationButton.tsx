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
      // ✅ 1. 获取当前位置（虚拟机或非 https 环境会失败）
      const fromLocation = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
        if (!navigator.geolocation) {
          console.warn('浏览器不支持地理定位')
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

      // ✅ 2. 通过高德 API 获取目的地坐标
      const apiKey = process.env.NEXT_PUBLIC_AMAP_KEY
      const geoUrl = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(location)}&key=${apiKey}`

      const geoRes = await fetch(geoUrl)
      const geoData = await geoRes.json()

      // ❗ 如果找不到目的地，则直接打开高德地图主页
      if (!geoData.geocodes?.length) {
        console.warn('未找到目的地位置，打开高德地图主页')
        window.open('https://www.amap.com/', '_blank')
        return
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

        // 如果2秒内没打开App，就回退到网页版
        setTimeout(() => {
          document.body.removeChild(iframe)

          let webUrl = `https://uri.amap.com/navigation?to=${lon},${lat},${encodeURIComponent(destName)}&mode=car&policy=1`
          if (fromLocation) {
            webUrl = `https://uri.amap.com/navigation?from=${fromLocation.lon},${fromLocation.lat},我的位置&to=${lon},${lat},${encodeURIComponent(destName)}&mode=car&policy=1`
          }
          window.open(webUrl, '_blank')
        }, 2000)
      } else {
        // PC端：如果无法获取当前位置，则直接打开高德地图主页
        if (!fromLocation) {
          console.warn('未获取到当前位置，打开高德地图主页')
          window.open('https://www.amap.com/', '_blank')
          return
        }

        // 正常情况：PC端导航
        let webUrl = `https://uri.amap.com/navigation?from=${fromLocation.lon},${fromLocation.lat},我的位置&to=${lon},${lat},${encodeURIComponent(destName)}&mode=car&policy=1`
        window.open(webUrl, '_blank')
      }
    } catch (error) {
      console.error('导航失败:', error)
      window.open('https://www.amap.com/', '_blank')
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
