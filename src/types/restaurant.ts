import { Types } from "mongoose";

export interface IBranch {
  _id: Types.ObjectId
    name: {
      ar: string;
      en: string;
    };
    location: {
      address: {
        ar: string;
        en: string;
      };
      latitude: number;
      longitude: number;
    };
    phone: string;
    workingHours: string;
    isMainBranch: boolean;
  }
  
  // تعريف نوع البيانات الخاص بالساعات
  export interface OpeningHours {
    open: string;
    close: string;
  }
  
  export interface BreakTime {
    start: string;
    end: string;
  }
  
  export interface RestaurantHours {
    weekdays: {
      sunday: OpeningHours;
      monday: OpeningHours;
      tuesday: OpeningHours;
      wednesday: OpeningHours;
      thursday: OpeningHours;
      friday: OpeningHours;
      saturday: OpeningHours;
    };
    isOpen24Hours: boolean;
    hasBreakTime: boolean;
    breakTime: BreakTime;
  }
  
  
  export interface IRestaurant {
    _id: Types.ObjectId;
    name: {
      ar: string;
      en: string;
    };
    subdomain: string;
    logo: string;
    coverImage: string;
    description: string;
  
  
  
    social: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
      twitter?: string;
    };
  
    branches: IBranch[];
    hours?: RestaurantHours[];
    isPublished?: boolean;
    phones: string[];

  
    createdAt?: Date;
    updatedAt?: Date;
  }
  