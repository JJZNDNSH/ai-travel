'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Camera } from 'lucide-react'

interface ScenicPhotosProps {
  destination: string
  itinerary?: any
  className?: string
}

interface Photo {
  id: string
  url: string
  title: string
  location: string
  description?: string
}

export default function ScenicPhotos({ destination, itinerary, className = '' }: ScenicPhotosProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScenicPhotos()
  }, [destination, itinerary])

  const fetchScenicPhotos = async () => {
    setLoading(true)
    try {
      // 这里使用Unsplash API获取景点图片
      // 在实际项目中，你可能需要替换为其他图片服务或自己的图片库
      const photoPromises: Promise<Photo>[] = []
      
      // 获取目的地的主要景点图片
      photoPromises.push(getPhotoByQuery(destination, `${destination}旅游景点`))
      photoPromises.push(getPhotoByQuery(destination, `${destination}风景`))
      photoPromises.push(getPhotoByQuery(destination, `${destination}地标`))
      
      // 如果有时程安排，获取具体景点的图片
      if (itinerary?.days) {
        itinerary.days.forEach((day: any) => {
          if (day.activities) {
            day.activities.forEach((activity: any) => {
              if (activity.location && activity.location !== destination) {
                photoPromises.push(getPhotoByQuery(activity.location, activity.activity))
              }
            })
          }
        })
      }

      const photoResults = await Promise.allSettled(photoPromises)
      const validPhotos = photoResults
        .filter((result): result is PromiseFulfilledResult<Photo> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter(photo => photo.url) // 过滤掉无效的图片

      setPhotos(validPhotos.slice(0, 8)) // 最多显示8张图片
    } catch (error) {
      console.error('获取景点图片失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPhotoByQuery = async (location: string, query: string): Promise<Photo> => {
    try {
      // 使用Unsplash API (需要注册获取API Key)
      const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
      
      if (unsplashKey) {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${unsplashKey}`
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            const photo = data.results[0]
            return {
              id: photo.id,
              url: photo.urls.regular,
              title: photo.alt_description || query,
              location: location,
              description: photo.description
            }
          }
        }
      }
      
      // 如果Unsplash不可用，使用占位图片
      return {
        id: `${location}-${query}`,
        url: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        title: query,
        location: location
      }
    } catch (error) {
      console.error('获取图片失败:', error)
      return {
        id: `${location}-${query}`,
        url: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        title: query,
        location: location
      }
    }
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">加载景点图片中...</p>
        </div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">暂无景点图片</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-white rounded-lg overflow-hidden shadow-lg ${className}`}>
      {/* 图片展示区域 */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={photos[currentIndex].url}
          alt={photos[currentIndex].title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* 图片信息 */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-lg font-bold mb-1">{photos[currentIndex].title}</h3>
          <div className="flex items-center text-sm opacity-90">
            <MapPin className="h-4 w-4 mr-1" />
            {photos[currentIndex].location}
          </div>
        </div>

        {/* 导航按钮 */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* 图片计数器 */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* 缩略图导航 */}
      {photos.length > 1 && (
        <div className="p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex ? 'border-indigo-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

