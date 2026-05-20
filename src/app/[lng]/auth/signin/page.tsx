import { Suspense } from "react"

import { LocalAuthPage } from "@/components/auth/local-auth-page"

type AuthPageProps = {
  params: Promise<{ lng?: string }>
}

export default async function SignInPage({ params }: AuthPageProps) {
  const { lng } = await params
  return (
    <Suspense>
      <LocalAuthPage locale={lng === "en" ? "en" : "ar"} />
    </Suspense>
  )
}
