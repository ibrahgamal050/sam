async function generateSeoData(restaurantName: string, pageName: string) {
  try {
    const prompt = `افترض أن هناك مطعم اسمه "${restaurantName}"، وأريد توليد بيانات السيو لصفحة "${pageName}".
    
أنشئ كائن JSON يحتوي على الحقول التالية:
{
  "seo": {
    "title": "عنوان الصفحة",
    "description": "وصف الصفحة",
    "keywords": ["مطعم", "طعام", "أفضل تجربة طعام"],
    "og_title": "عنوان أوبن جرافيك",
    "og_description": "وصف أوبن جرافيك",
    "og_image": "/path/to/image.jpg",
    "og_type": "website",
    "twitter_card": "summary_large_image",
    "twitter_title": "عنوان تويتر",
    "twitter_description": "وصف تويتر",
    "twitter_image": "/path/to/twitter/image.jpg",
    "canonical_url": "https://example.com/${pageName}",
    "structured_data": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${pageName}",
      "url": "https://example.com/${pageName}",
      "image": "/path/to/image.jpg",
      "hasMenu": {
        "@type": "Menu",
        "name": "قائمة الطعام",
        "description": "قائمة طعام رائعة",
        "hasMenuSection": [
          {
            "@type": "MenuSection",
            "name": "المقبلات",
            "image": "/path/to/section/image.jpg"
          }
        ]
      }
    }
  }
}
من الأفضل أن لا يتجاوز title طول 60 حرفًا.
رجّع فقط الكائن بصيغة JSON صالحة بدون أي شرح أو رموز برمجية.`;

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a professional SEO content generator. Always return clean, valid JSON with no explanations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    };

    console.log(`🚀 Sending SEO generation request for "${restaurantName}" page "${pageName}"...`);
    const response = await fetch('https://api.perplexity.ai/chat/completions', options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const raw = result.choices[0].message.content.trim();
    const clean = raw.replace(/```(json|javascript)?/g, '').trim();
    const parsed = JSON.parse(clean);

    const seo = parsed.seo;

    // ✅ تعديل البيانات قبل الإرجاع
    if (seo.title && seo.title.length > 60) {
      seo.title = seo.title.slice(0, 57).trim() + '...';
    }

    const validOgTypes = ['website', 'article', 'profile'];
    if (!validOgTypes.includes(seo.og_type)) {
      seo.og_type = 'website'; // الافتراضي
    }

    console.log('✅ SEO data generated successfully');
    return seo;
  } catch (err) {
    console.error('❌ حدث خطأ أثناء توليد بيانات السيو:', err instanceof Error ? err.message : err);
    return null;
  }
}

export default generateSeoData;
