import { create } from 'zustand'
import activitiesData from '@/data/activities.json'

export interface Activity {
  id: string
  name: string
  description: string
  duration: string
  pricePerPerson: number
  currency: string
  difficulty: 1 | 2 | 3
  category: string
  icon: string
}

interface DaySlot {
  morning: Activity | null
  afternoon: Activity | null
}

interface TripState {
  days: DaySlot[]
  numberOfPeople: number
  addActivity: (dayIndex: number, slot: 'morning' | 'afternoon', activity: Activity) => void
  removeActivity: (dayIndex: number, slot: 'morning' | 'afternoon') => void
  setNumberOfPeople: (n: number) => void
  getTotalPrice: () => { subtotal: number; discount: number; logistics: number; total: number; totalUSD: number }
  saveItinerary: () => void
}

export const useTripStore = create<TripState>((set, get) => ({
  days: [
    { morning: null, afternoon: null },
    { morning: null, afternoon: null },
    { morning: null, afternoon: null },
  ],
  numberOfPeople: 2,

  addActivity: (dayIndex, slot, activity) =>
    set((state) => {
      const newDays = state.days.map((day, i) => {
        if (i !== dayIndex) return day
        return { ...day, [slot]: activity }
      })
      return { days: newDays }
    }),

  removeActivity: (dayIndex, slot) =>
    set((state) => {
      const newDays = state.days.map((day, i) => {
        if (i !== dayIndex) return day
        return { ...day, [slot]: null }
      })
      return { days: newDays }
    }),

  setNumberOfPeople: (n) => set({ numberOfPeople: Math.max(1, Math.min(15, n)) }),

  getTotalPrice: () => {
    const { days, numberOfPeople } = get()
    const { discounts, logistics, exchangeRate } = activitiesData

    const activities = days.flatMap((d) =>
      [d.morning, d.afternoon].filter((a): a is Activity => a !== null)
    )

    const subtotal = activities.reduce((sum, a) => sum + a.pricePerPerson * numberOfPeople, 0)

    const applicableDiscount = [...discounts]
      .reverse()
      .find((d) => numberOfPeople >= d.minPeople)
    const discountRate = applicableDiscount ? applicableDiscount.percentage / 100 : 0
    const discount = subtotal * discountRate

    const logisticsCost = logistics.baseTransportCost
    const total = subtotal - discount + logisticsCost
    const totalUSD = total * exchangeRate.BOBtoUSD

    return { subtotal, discount, logistics: logisticsCost, total, totalUSD }
  },

  saveItinerary: () => {
    const { days, numberOfPeople, getTotalPrice } = get()
    const pricing = getTotalPrice()
    const itinerary = { days, numberOfPeople, pricing, savedAt: new Date().toISOString() }
    if (typeof window !== 'undefined') {
      localStorage.setItem('guajojo-itinerary', JSON.stringify(itinerary))
    }
  },
}))
