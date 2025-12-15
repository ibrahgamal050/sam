// apps/sites/src/app/auth/error/page.tsx
type PageProps = {
  params: Promise<{ lng?: string }>
  searchParams: { reason?: string; status?: string; detail?: string }
}

export default async function AuthErrorPage({ params, searchParams }: PageProps) {
  const { lng = "ar" } = await params
  const { reason = "unknown", status, detail } = searchParams
  const homeHref = `/${lng}`
  const dir = lng === "ar" ? "rtl" : "ltr"

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 24 }} dir={dir}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>حصل خطأ أثناء تسجيل الدخول</h1>
      <p style={{ marginBottom: 12 }}>
        السبب: <b>{reason}</b>
        {status ? ` (HTTP ${status})` : ""}
      </p>
      {detail ? (
        <>
          <h3 style={{ fontWeight: 600, marginBottom: 6 }}>تفاصيل</h3>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f6f6f6",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {detail}
          </pre>
        </>
      ) : null}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <a
          href="/auth/signin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 14px",
            borderRadius: 12,
            background: "#000",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          جرّب مرة أخرى
        </a>
        <a
          href={homeHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 14px",
            borderRadius: 12,
            background: "#f4f4f5",
            color: "#111",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          العودة للصفحة الرئيسية
        </a>
      </div>
    </main>
  )
}
