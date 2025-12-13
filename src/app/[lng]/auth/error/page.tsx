// apps/sites/src/app/auth/error/page.tsx
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string; status?: string; detail?: string }
}) {
  const { reason = "unknown", status, detail } = searchParams
  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
      <h1>حصل خطأ أثناء تسجيل الدخول</h1>
      <p>السبب: <b>{reason}</b>{status ? ` (HTTP ${status})` : ""}</p>
      {detail ? (
        <>
          <h3>تفاصيل</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f6f6f6", padding: 12, borderRadius: 8 }}>
            {detail}
          </pre>
        </>
      ) : null}
      <a href="/auth/signin" style={{ display: "inline-block", marginTop: 16 }}>جرّب مرة أخرى</a>
    </main>
  )
}
