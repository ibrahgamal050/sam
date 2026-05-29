import { Types } from "mongoose"

export type DomainAlias = {
  host: string
  redirectTo?: string
  active: boolean
  createdAt: Date
}

export interface IBranch {
  _id: Types.ObjectId
  name: {
    ar: string
    en: string
    ru: string // ✅ added
  }
  location: {
    address: {
      ar: string
      en: string
      ru: string // ✅ added
    }
    latitude: number
    longitude: number
  }
  phone: string
  workingHours: string
  isMainBranch: boolean
}

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
    ru: string // ✅ added
  }

  subdomain: string
  canonicalHost?: string | null
  domainAliases: DomainAlias[]

  logo: string
  coverImage: string

  description: {
    ar: string
    en: string
    ru: string // ✅ changed from string → multilingual
  }

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