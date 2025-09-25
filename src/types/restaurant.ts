import { Types } from "mongoose"

export type DomainAlias = {
  // example: "abdo.meelza.site" أو "abdo.com"
  host: string
  // لو موجود: حوّل 301 إلى هذا الهوست
  redirectTo?: string
  active: boolean
  createdAt: Date
}

export interface IBranch {
  _id: Types.ObjectId
  name: {
    ar: string
    en: string
  }
  location: {
    address: {
      ar: string
      en: string
    }
    latitude: number
    longitude: number
  }
  phone: string
  workingHours: string
  isMainBranch: boolean
}

// تعريف نوع البيانات الخاصة بساعات العمل
export interface OpeningHours {
  open: string
  close: string
}

export interface BreakTime {
  start: string
  end: string
}

export interface RestaurantHours {
  weekdays: {
    sunday: OpeningHours
    monday: OpeningHours
    tuesday: OpeningHours
    wednesday: OpeningHours
    thursday: OpeningHours
    friday: OpeningHours
    saturday: OpeningHours
  }
  isOpen24Hours: boolean
  hasBreakTime: boolean
  breakTime: BreakTime
}

export interface IRestaurant {
  _id: Types.ObjectId
  name: {
    ar: string
    en: string
  }
  subdomain: string
  // الهوست الأساسي: "abdo.com" أو "abdo.meelza.site"
  canonicalHost?: string | null
  // الدومينات القديمة أو الثانوية
  domainAliases: DomainAlias[]
  logo: string
  coverImage: string
  description: string
  social: {
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
  }
  branches: IBranch[]
  hours?: RestaurantHours[]
  isPublished?: boolean
  phones: string[]
  createdAt?: Date
  updatedAt?: Date
}
