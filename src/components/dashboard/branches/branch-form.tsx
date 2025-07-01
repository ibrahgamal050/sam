"use client"

import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { IBranch, IBranchHours } from "@/types"

const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as const

const daySchema = z.object({
  open: z.string(),
  close: z.string(),
})

const formSchema = z.object({
  nameEn: z.string().min(1, { message: "Required" }),
  nameAr: z.string().min(1, { message: "Required" }),
  addressEn: z.string().min(1, { message: "Required" }),
  addressAr: z.string().min(1, { message: "Required" }),
  phone: z.string().min(1, { message: "Required" }),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  isMainBranch: z.boolean().default(false),
  isOpen24Hours: z.boolean().default(false),
  hasBreakTime: z.boolean().default(false),
  workingHours: z.object({
    sunday: daySchema,
    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema,
    friday: daySchema,
    saturday: daySchema,
  }),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
})

export type BranchFormValues = z.infer<typeof formSchema>

interface BranchFormProps {
  initialData?: IBranch
  onSubmit: (data: BranchFormValues) => void
}

export function BranchForm({ initialData, onSubmit }: BranchFormProps) {
  const defaultHours: IBranchHours = days.reduce((acc, day) => {
    acc[day] = { open: "", close: "" }
    return acc
  }, {} as IBranchHours)

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? {
      nameEn: "",
      nameAr: "",
      addressEn: "",
      addressAr: "",
      phone: "",
      latitude: "",
      longitude: "",
      isMainBranch: false,
      isOpen24Hours: false,
      hasBreakTime: false,
      workingHours: defaultHours,
      breakStart: "",
      breakEnd: "",
    },
  })

  const open24 = form.watch("isOpen24Hours")
  const hasBreak = form.watch("hasBreakTime")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="nameEn" render={({ field }) => (
            <FormItem>
              <FormLabel>Name (English)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="nameAr" render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Arabic)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="addressEn" render={({ field }) => (
            <FormItem>
              <FormLabel>Address (English)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="addressAr" render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Arabic)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="latitude" render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="longitude" render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="isMainBranch" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Main Branch</FormLabel>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />
        <FormField control={form.control} name="isOpen24Hours" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Open 24 Hours</FormLabel>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />
        {!open24 && (
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day} className="grid gap-2 md:grid-cols-2">
                <FormField control={form.control} name={`workingHours.${day}.open` as const} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{day} Open</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`workingHours.${day}.close` as const} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{day} Close</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            ))}
          </div>
        )}
        <FormField control={form.control} name="hasBreakTime" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Has Break Time</FormLabel>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />
        {hasBreak && (
          <div className="grid gap-4 md:grid-cols-2">
            <FormField control={form.control} name="breakStart" render={({ field }) => (
              <FormItem>
                <FormLabel>Break Start</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="breakEnd" render={({ field }) => (
              <FormItem>
                <FormLabel>Break End</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}
        <Button type="submit">Save Branch</Button>
      </form>
    </Form>
  )
}