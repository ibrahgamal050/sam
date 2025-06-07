async function generateInfoData(restaurantName: string) {
    try {
      console.log(`Generating improved branches for ${restaurantName} using Perplexity API...`);
  
      const prompt =`ابحث أولاً على الإنترنت عن معلومات عن مطعم باسم ${restaurantName} في مصر أو في أي دولة عربية إن وُجد، ثم استخدم هذه المعلومات لإنشاء كائن JSON يحتوي فقط على البيانات التالية:

      - name: اسم المطعم بالعربية والإنجليزية داخل كائن فيه الحقلين "ar" و "en".
      - subdomain: اسم فرعي باللغة الإنجليزية يصلح للاستخدام في عنوان URL، بدون مسافات.
      - logo: مسار صورة للوجو بصيغة "/subdomain/logo.jpg".
      - coverImage: مسار صورة الكفر بصيغة "/subdomain/cover.jpg".
      - description: وصف جذاب ومختصر للمطعم.
      
      رجّع فقط الكائن بهذا الشكل بصيغة JSON صالحة تمامًا بدون أي شرح أو تنسيقات إضافية:
      
      {
        "name": {
          "ar": "اسم المطعم بالعربي",
          "en": "Name Restaurant in English"
        },
        "subdomain": "restaurant-subdomain",
        "logo": "/restaurant-subdomain/logo.jpg",
        "coverImage": "/restaurant-subdomain/cover.jpg",
        "description": "وصف مختصر جذاب للمطعم يوحي بتجربة مميزة.",
       
      }`;
      
  
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content: "You are a professional data generator specializing in location data. Always return valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      };
  
      console.log("Sending request to Perplexity API...");
      const response = await fetch('https://api.perplexity.ai/chat/completions', options);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
  
      console.log("Received response from Perplexity API");
  
      // تنظيف وتفريغ المحتوى
      let rawContent = data.choices[0].message.content.trim();
      if (rawContent.startsWith("```")) {
        rawContent = rawContent.replace(/```(json|javascript)?\n?/gi, "").replace(/```$/, "").trim();
      }
  
      const parsedData = JSON.parse(rawContent);
  
      return parsedData;
  
    } catch (error) {
      console.error("❌ حدث خطأ أثناء توليد البيانات:", error);
      return null;
    }
  }
  
  export default generateInfoData;
  