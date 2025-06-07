const axios = require('axios');

async function getTopRatedRestaurantsByReviews(location, radius = 5000) {
  const apiKey = 'AIzaSyChhVnvGYEwcYXQ49eE_T4vFgEQvq0WAcI';
  let results = [];
  let nextPageToken = null;

  do {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
    const params = {
      location,
      radius,
      type: 'restaurant', // <--- هنا حددنا النوع "مطعم" فقط
      language: 'ar', // حطينا اللغة عربي
      key: apiKey,
      pagetoken: nextPageToken,
    };

    const { data } = await axios.get(url, { params });
    results = results.concat(data.results);

    nextPageToken = data.next_page_token;

    if (nextPageToken) {
      await new Promise(res => setTimeout(res, 2000)); // لازم تستنى شوية للصفحة التانية
    }
  } while (nextPageToken);

  const sorted = results
    .filter(r => r.user_ratings_total >= 1000)
    .sort((a, b) => b.user_ratings_total - a.user_ratings_total);

  return sorted.map(r => ({
    name: r.name,
    rating: r.rating,
    reviews: r.user_ratings_total,
    address: r.vicinity,
  }));
}

// مثال استخدام
getTopRatedRestaurantsByReviews("30.1152803,31.3538447")
  .then(console.log)
  .catch(console.error);