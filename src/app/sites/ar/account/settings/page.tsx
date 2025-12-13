"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useSession } from '@/lib/nextauth-shim'
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MapPin, ShieldCheck, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useDeliveryAddress } from "@/contexts/delivery-address-context"

const profileSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يتكوّن من حرفين على الأقل" }),
  email: z.string().email({ message: "أدخل بريدًا إلكترونيًا صالحًا" }),
  phone: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value && value.length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "رقم الجوال يجب أن يحتوي على 8 أرقام على الأقل" })
      }
    }),
  marketingOptIn: z.boolean().default(true),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "الرقم السري الحالي غير صحيح" }),
    newPassword: z.string().min(6, { message: "الرقم السري الجديد يجب ألا يقل عن 6 خانات" }),
    confirmPassword: z.string().min(6, { message: "يرجى تأكيد الرقم السري" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "الرقم السري غير متطابق",
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

const addressFormSchema = z.object({
  name: z.string().min(2, { message: "أدخل اسمًا موجزًا للعنوان" }),
  address: z.string().min(4, { message: "أدخل تفاصيل العنوان" }),
  city: z.string().min(2, { message: "اسم المدينة مطلوب" }),
  lat: z.coerce.number({ invalid_type_error: "أدخل قيمة رقمية صحيحة لخط العرض" }),
  lng: z.coerce.number({ invalid_type_error: "أدخل قيمة رقمية صحيحة لخط الطول" }),
  isDefault: z.boolean().optional(),
})

type AddressFormValues = z.infer<typeof addressFormSchema>

export default function CustomerSettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const {
    addresses,
    addAddress: addDeliveryAddress,
    updateAddress: updateDeliveryAddress,
    deleteAddress: deleteDeliveryAddress,
    setDefaultAddress: setDefaultDeliveryAddress,
    isLoading: addressesLoading,
  } = useDeliveryAddress()
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [addressMessage, setAddressMessage] = useState<string | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  const initialProfileValues = useMemo<ProfileFormValues>(
    () => ({
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: (session?.user as { phone?: string | null } | undefined)?.phone?.trim() ?? "",
      marketingOptIn: true,
    }),
    [session],
  )

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialProfileValues,
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const newAddressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { name: "", address: "", city: "", lat: 0, lng: 0, isDefault: false },
  })

  const editAddressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { name: "", address: "", city: "", lat: 0, lng: 0, isDefault: false },
  })

  const { isSubmitting: profileSubmitting } = profileForm.formState
  const { isSubmitting: passwordSubmitting } = passwordForm.formState
  const { isSubmitting: newAddressSubmitting } = newAddressForm.formState
  const { isSubmitting: editAddressSubmitting } = editAddressForm.formState

  useEffect(() => {
    profileForm.reset(initialProfileValues)
  }, [initialProfileValues, profileForm])

  useEffect(() => {
    if (addresses.length === 0) {
      newAddressForm.setValue("isDefault", true)
    }
  }, [addresses.length, newAddressForm])

  useEffect(() => {
    if (!editingAddressId) {
      return
    }

    const target = addresses.find((address) => address.id === editingAddressId)

    if (target) {
      editAddressForm.reset({
        name: target.name,
        address: target.address,
        city: target.city,
        lat: target.lat,
        lng: target.lng,
        isDefault: target.isDefault ?? false,
      })
    }
  }, [editingAddressId, addresses, editAddressForm])

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          جاري تحميل بيانات الحساب...
        </div>
      </main>
    )
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4" dir="rtl">
        <Card className="w-full max-w-md border-0 shadow-lg shadow-[#6c5ce7]/10">
          <CardHeader className="text-right">
            <CardTitle className="text-2xl text-gray-900">تسجيل الدخول مطلوب</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              تحتاج إلى تسجيل الدخول للوصول إلى إعدادات حسابك ومزامنة بيانات الطلبات.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-end">
            <Button
              onClick={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/ar/account/settings")}`)}
              className="rounded-2xl bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/20"
            >
              تسجيل الدخول الآن
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setProfileMessage(null)
    setProfileError(null)

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("FAILED")
      }

      setProfileMessage("تم تحديث بيانات حسابك بنجاح")
    } catch (error) {
      console.error("Profile update failed", error)
      setProfileError("تعذّر حفظ التعديلات، حاول مرة أخرى")
    }
  }

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordMessage(null)
    setPasswordError(null)

    try {
      const response = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("FAILED")
      }

      setPasswordMessage("تم تحديث الرقم السري بنجاح")
      passwordForm.reset()
    } catch (error) {
      console.error("Password update failed", error)
      setPasswordError("تعذّر تحديث الرقم السري، حاول مرة أخرى")
    }
  }

  const handleAddAddress = async (values: AddressFormValues) => {
    try {
      setAddressMessage(null)
      setAddressError(null)
      await addDeliveryAddress(values)
      setAddressMessage("تم إضافة العنوان بنجاح")
      newAddressForm.reset({ name: "", address: "", city: "", lat: 0, lng: 0, isDefault: false })
    } catch (error) {
      console.error("Failed to add address", error)
      setAddressError("تعذّر إضافة العنوان، حاول مرة أخرى")
    }
  }

  const handleEditAddress = async (values: AddressFormValues) => {
    if (!editingAddressId) return

    try {
      setAddressMessage(null)
      setAddressError(null)
      await updateDeliveryAddress(editingAddressId, values)
      setAddressMessage("تم تحديث العنوان بنجاح")
      setEditingAddressId(null)
    } catch (error) {
      console.error("Failed to update address", error)
      setAddressError("تعذّر تحديث العنوان، حاول مرة أخرى")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (addressesLoading) return
    const confirmed = typeof window !== "undefined" ? window.confirm("هل تريد حذف هذا العنوان؟") : true
    if (!confirmed) return

    try {
      setAddressMessage(null)
      setAddressError(null)
      await deleteDeliveryAddress(id)
      setAddressMessage("تم حذف العنوان")
      if (editingAddressId === id) {
        setEditingAddressId(null)
      }
    } catch (error) {
      console.error("Failed to delete address", error)
      setAddressError("تعذّر حذف العنوان")
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      setAddressMessage(null)
      setAddressError(null)
      await setDefaultDeliveryAddress(id)
      setAddressMessage("تم تعيين العنوان كافتراضي")
    } catch (error) {
      console.error("Failed to set default address", error)
      setAddressError("تعذّر ضبط العنوان الافتراضي")
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4">
        <header className="space-y-2 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#6c5ce7]">حساب العميل</p>
          <h1 className="text-3xl font-bold text-gray-900">إعدادات الملف الشخصي</h1>
          <p className="text-sm text-gray-500">حدّث معلوماتك الأساسية وتأكد من أن بيانات حسابك محدثة دائمًا.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-8">
            <Card className="border-0 shadow-lg shadow-[#6c5ce7]/5">
              <CardHeader className="text-right">
                <CardTitle className="text-2xl text-gray-900">البيانات الشخصية</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  حدّث اسمك، بريدك الإلكتروني، ورقم هاتف التواصل.
                </CardDescription>
              </CardHeader>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                <CardContent className="space-y-5">
                  <Field label="الاسم الكامل" error={profileForm.formState.errors.name?.message}>
                    <Input
                      {...profileForm.register("name")}
                      placeholder="مثال: أحمد القاضي"
                      disabled={profileSubmitting}
                      className="text-right"
                    />
                  </Field>

                  <Field label="البريد الإلكتروني" error={profileForm.formState.errors.email?.message}>
                    <Input
                      type="email"
                      {...profileForm.register("email")}
                      placeholder="name@example.com"
                      disabled={profileSubmitting}
                      className="text-right"
                    />
                  </Field>

                  <Field label="رقم الجوال" error={profileForm.formState.errors.phone?.message}>
                    <Input
                      {...profileForm.register("phone")}
                      placeholder="05xxxxxxxx"
                      disabled={profileSubmitting}
                      className="text-right"
                    />
                  </Field>

                  <Controller
                    name="marketingOptIn"
                    control={profileForm.control}
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 text-right">
                        <div>
                          <p className="text-sm font-medium text-gray-900">استقبال التحديثات والعروض</p>
                          <p className="text-xs text-gray-500">نرسل لك إشعارات بآخر العروض والمطاعم الجديدة على ميلزا.</p>
                        </div>
                        <Switch
                          disabled={profileSubmitting}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-label="استقبال التحديثات والعروض"
                        />
                      </div>
                    )}
                  />

                  {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}
                  {profileError && <p className="text-sm text-red-500">{profileError}</p>}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    type="submit"
                    className="min-w-[160px] rounded-2xl bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/20"
                    disabled={profileSubmitting}
                  >
                    {profileSubmitting ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      "حفظ التغييرات"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="border-0 shadow-lg shadow-[#6c5ce7]/5">
              <CardHeader className="text-right">
                <CardTitle className="text-2xl text-gray-900">الأمان وكلمة المرور</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  استخدم كلمة سر قوية لحماية حسابك من الوصول غير المصرّح به.
                </CardDescription>
              </CardHeader>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                <CardContent className="space-y-5">
                  <Field label="الرقم السري الحالي" error={passwordForm.formState.errors.currentPassword?.message}>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...passwordForm.register("currentPassword")}
                      disabled={passwordSubmitting}
                      className="text-right"
                    />
                  </Field>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="الرقم السري الجديد" error={passwordForm.formState.errors.newPassword?.message}>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...passwordForm.register("newPassword")}
                        disabled={passwordSubmitting}
                        className="text-right"
                      />
                    </Field>

                    <Field label="تأكيد الرقم السري" error={passwordForm.formState.errors.confirmPassword?.message}>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...passwordForm.register("confirmPassword")}
                        disabled={passwordSubmitting}
                        className="text-right"
                      />
                    </Field>
                  </div>

                  <div className="rounded-2xl bg-[#f5f3ff] p-4 text-right text-sm text-[#6c5ce7]">
                    <div className="mb-2 flex items-center justify-end gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="font-semibold">نصيحة أمنية</span>
                    </div>
                    استخدم مزيجًا من الحروف والأرقام والرموز، وتجنّب إعادة استخدام كلمة السر في أكثر من منصة.
                  </div>

                  {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
                  {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    className="min-w-[160px] rounded-2xl border-[#6c5ce7] text-[#6c5ce7] hover:bg-[#6c5ce7]/10"
                    disabled={passwordSubmitting}
                  >
                    {passwordSubmitting ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري التحديث...
                      </>
                    ) : (
                      "تحديث الرقم السري"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="border-0 bg-gradient-to-br from-white via-[#f7f5ff] to-white shadow-lg shadow-[#6c5ce7]/10">
              <CardHeader className="text-right">
                <CardTitle className="text-lg font-semibold text-gray-900">خصوصيتك تهمنا</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  يتم تشفير بياناتك الحساسة ولا يتم مشاركتها مع أي طرف ثالث دون إذنك.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-6 text-gray-500">
                <p>يمكنك طلب تنزيل نسخة من بياناتك أو حذف الحساب بالكامل من خلال التواصل مع دعم ميلزا.</p>
                <Separator className="bg-[#6c5ce7]/20" />
                <p>
                  إذا لاحظت نشاطًا مريبًا على حسابك، قم بتحديث كلمة المرور فورًا وتواصل مع فريق الدعم.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-[#6c5ce7]/5">
              <CardHeader className="text-right">
                <CardTitle className="text-lg font-semibold text-gray-900">عناوين التوصيل</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  أضف عناوين جديدة أو حدّث العناوين الحالية وحدد عنوانك الافتراضي للتوصيل السريع.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {addressesLoading && addresses.length === 0 ? (
                    <div className="space-y-3">
                      <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
                      <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                      لا توجد عناوين محفوظة بعد. استخدم النموذج بالأسفل لإضافة عنوان جديد.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div key={address.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 text-right">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold text-gray-900">{address.name}</h3>
                                {address.isDefault && (
                                  <span className="rounded-full bg-[#6c5ce7]/10 px-2 py-[2px] text-xs font-semibold text-[#6c5ce7]">
                                    العنوان الافتراضي
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{address.address}</p>
                              <p className="text-xs text-gray-400">{address.city}</p>
                            </div>
                            <MapPin className="h-5 w-5 text-[#6c5ce7]/60" />
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              disabled={address.isDefault || addressesLoading || editAddressSubmitting}
                            >
                              جعل افتراضي
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => setEditingAddressId(address.id)}
                              disabled={editAddressSubmitting}
                            >
                              تعديل
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={addressesLoading || editAddressSubmitting}
                            >
                              <Trash2 className="h-4 w-4" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {addressMessage && <p className="text-sm text-green-600">{addressMessage}</p>}
                {addressError && <p className="text-sm text-red-500">{addressError}</p>}

                <div className="rounded-2xl bg-gray-50 p-4">
                  <h4 className="mb-3 text-right text-base font-semibold text-gray-900">إضافة عنوان جديد</h4>
                  <form onSubmit={newAddressForm.handleSubmit(handleAddAddress)} className="space-y-4">
                    <Field label="اسم العنوان" error={newAddressForm.formState.errors.name?.message}>
                      <Input
                        placeholder="مثال: المنزل، العمل"
                        className="text-right"
                        disabled={newAddressSubmitting}
                        {...newAddressForm.register("name")}
                      />
                    </Field>

                    <Field label="تفاصيل العنوان" error={newAddressForm.formState.errors.address?.message}>
                      <Textarea
                        placeholder="الشارع، المبنى، المعلم القريب"
                        className="min-h-[80px] text-right"
                        disabled={newAddressSubmitting}
                        {...newAddressForm.register("address")}
                      />
                    </Field>

                    <Field label="المدينة" error={newAddressForm.formState.errors.city?.message}>
                      <Input
                        placeholder="اسم المدينة"
                        className="text-right"
                        disabled={newAddressSubmitting}
                        {...newAddressForm.register("city")}
                      />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="خط العرض" error={newAddressForm.formState.errors.lat?.message}>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="مثل: 30.0444"
                          className="text-right"
                          disabled={newAddressSubmitting}
                          {...newAddressForm.register("lat")}
                        />
                      </Field>
                      <Field label="خط الطول" error={newAddressForm.formState.errors.lng?.message}>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="مثل: 31.2357"
                          className="text-right"
                          disabled={newAddressSubmitting}
                          {...newAddressForm.register("lng")}
                        />
                      </Field>
                    </div>

                    <Controller
                      control={newAddressForm.control}
                      name="isDefault"
                      render={({ field }) => (
                        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                          <div className="text-right text-xs text-gray-600">
                            <p className="font-medium text-gray-900">تعيين كعنوان افتراضي</p>
                            <p>سيتم استخدام هذا العنوان تلقائيًا في طلباتك القادمة.</p>
                          </div>
                          <Switch checked={field.value} onCheckedChange={field.onChange} disabled={newAddressSubmitting} />
                        </div>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full rounded-2xl bg-[#6c5ce7] text-white"
                      disabled={newAddressSubmitting}
                    >
                      {newAddressSubmitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الإضافة...
                        </>
                      ) : (
                        "إضافة العنوان"
                      )}
                    </Button>
                  </form>
                </div>

                {editingAddressId && (
                  <div className="rounded-2xl border border-[#6c5ce7]/20 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-base font-semibold text-gray-900">تعديل العنوان</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAddressId(null)}
                        disabled={editAddressSubmitting}
                      >
                        إلغاء
                      </Button>
                    </div>
                    <form onSubmit={editAddressForm.handleSubmit(handleEditAddress)} className="space-y-4">
                      <Field label="اسم العنوان" error={editAddressForm.formState.errors.name?.message}>
                        <Input
                          className="text-right"
                          disabled={editAddressSubmitting}
                          {...editAddressForm.register("name")}
                        />
                      </Field>

                      <Field label="تفاصيل العنوان" error={editAddressForm.formState.errors.address?.message}>
                        <Textarea
                          className="min-h-[80px] text-right"
                          disabled={editAddressSubmitting}
                          {...editAddressForm.register("address")}
                        />
                      </Field>

                      <Field label="المدينة" error={editAddressForm.formState.errors.city?.message}>
                        <Input
                          className="text-right"
                          disabled={editAddressSubmitting}
                          {...editAddressForm.register("city")}
                        />
                      </Field>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="خط العرض" error={editAddressForm.formState.errors.lat?.message}>
                          <Input
                            type="number"
                            step="0.0001"
                            className="text-right"
                            disabled={editAddressSubmitting}
                            {...editAddressForm.register("lat")}
                          />
                        </Field>
                        <Field label="خط الطول" error={editAddressForm.formState.errors.lng?.message}>
                          <Input
                            type="number"
                            step="0.0001"
                            className="text-right"
                            disabled={editAddressSubmitting}
                            {...editAddressForm.register("lng")}
                          />
                        </Field>
                      </div>

                      <Controller
                        control={editAddressForm.control}
                        name="isDefault"
                        render={({ field }) => (
                          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                            <div className="text-right text-xs text-gray-600">
                              <p className="font-medium text-gray-900">اجعل العنوان افتراضيًا</p>
                              <p>سيتم تعيين هذا العنوان كافتراضي إن قمت بتفعيل الخيار.</p>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={editAddressSubmitting} />
                          </div>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full rounded-2xl bg-[#6c5ce7] text-white"
                        disabled={editAddressSubmitting}
                      >
                        {editAddressSubmitting ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          "حفظ التعديلات"
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2 text-right">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
