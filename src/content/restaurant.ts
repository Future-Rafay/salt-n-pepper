export const restaurantContent = {
  legalBusinessName: "SaltNPepper",
  displayName: "SaltNPepper",
  address: {
    street: "Allmendstrasse 18",
    postalCode: "8154",
    city: "Oberglatt",
    region: "Zurich",
    country: "Switzerland",
  },
  phone: "+41 76 408 94 30",
  email: "info@saltnpepper.ch",
  domain: "saltnpepper.ch",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Allmendstrasse%2018%2C%208154%20Oberglatt",
  logo: null,
  compactLogo: null,
  heroImage: "/images/editorial/restaurant-table.jpg",
  copy: {
    de: {
      eyebrow: "Ihr Restaurant in Oberglatt",
      heroTitle: "Frisch. Lokal. SaltNPepper.",
      heroSubtitle: "SaltNPepper ist Ihr lokales Restaurant in Oberglatt – frisch zubereitet und einfach online bestellt.",
      aboutTitle: "Gutes Essen, unkompliziert serviert.",
      about: "Wir schaffen einen Ort für frisch zubereitetes Essen, herzliche Begegnungen und einfache Bestellungen. Unser echtes Menü und unsere Öffnungszeiten werden hier veröffentlicht, sobald sie bestätigt sind.",
    },
    en: {
      eyebrow: "Your restaurant in Oberglatt",
      heroTitle: "Fresh. Local. SaltNPepper.",
      heroSubtitle: "SaltNPepper is your local restaurant in Oberglatt, serving freshly prepared food with simple online ordering.",
      aboutTitle: "Good food, served simply.",
      about: "We are creating a place for freshly prepared food, warm encounters, and simple ordering. Our real menu and opening hours will appear here as soon as they are confirmed.",
    },
  },
} as const;

export const editorialPhotography = [
  {
    use: "Landing page hero",
    file: "/images/editorial/restaurant-table.jpg",
    source: "https://unsplash.com/photos/white-ceramic-plate-and-silver-flatware-on-table-u1f5MnVGc-o",
    credit: "Temporary editorial photograph from Unsplash",
  },
  {
    use: "Shared dining",
    file: "/images/editorial/food-preparation.jpg",
    source: "https://unsplash.com/photos/a-table-topped-with-plates-of-food-and-drinks-KII3oYvuIn8",
    credit: "Temporary editorial photograph from Unsplash",
  },
  {
    use: "Restaurant atmosphere",
    file: "/images/editorial/restaurant-atmosphere.jpg",
    source: "https://unsplash.com/photos/photo-1650288021655-28883d80e1bf",
    credit: "Temporary editorial photograph from Unsplash",
  },
] as const;

export const productPhotography = [
  { key: "SaltNPepper/products/samosa.jpg", source: "https://unsplash.com/photos/3oc6OzX4LaQ", credit: "Juli Moreira / Unsplash", use: "Vegetable Samosa" },
  { key: "SaltNPepper/products/chicken-pakora.jpg", source: "https://unsplash.com/photos/inz8vyeEumY", credit: "Abhijit Biswas / Unsplash", use: "Chicken Pakora" },
  { key: "SaltNPepper/products/chicken-tikka.jpg", source: "https://unsplash.com/photos/d0ey0aExQbk", credit: "Dr Muhammad Amer / Unsplash", use: "Chicken Tikka and Seekh Kebab" },
  { key: "SaltNPepper/products/mixed-grill.jpg", source: "https://unsplash.com/photos/gM5Bdzp7LhY", credit: "Gang Hao / Unsplash", use: "Mixed Grill" },
  { key: "SaltNPepper/products/butter-chicken.jpg", source: "https://unsplash.com/photos/sqcH2q7lkvo", credit: "Raman / Unsplash", use: "Butter Chicken" },
  { key: "SaltNPepper/products/chicken-karahi.jpg", source: "https://unsplash.com/photos/8zLfugmjMLc", credit: "Imad 786 / Unsplash", use: "Chicken Karahi and Chana Masala" },
  { key: "SaltNPepper/products/chana-masala.jpg", source: "https://unsplash.com/photos/owkrXxo5vdA", credit: "Rahul Chakraborty / Unsplash", use: "Chana Masala" },
  { key: "SaltNPepper/products/chicken-biryani.jpg", source: "https://unsplash.com/photos/ysmeQt1dzcw", credit: "Mario Raj / Unsplash", use: "Chicken and Vegetable Biryani" },
  { key: "SaltNPepper/products/vegetable-biryani.jpg", source: "https://unsplash.com/photos/0fUy3hnEJoI", credit: "Kalyani Akella / Unsplash", use: "Vegetable Biryani" },
  { key: "SaltNPepper/products/naan.jpg", source: "https://unsplash.com/photos/h7cZs0aFicw", credit: "Rashpal Singh / Unsplash", use: "Naan" },
  { key: "SaltNPepper/products/mango-lassi.jpg", source: "https://unsplash.com/photos/7H82VXTVifU", credit: "Lakshya Thakur / Unsplash", use: "Mango Lassi" },
  { key: "SaltNPepper/products/gulab-jamun.jpg", source: "https://unsplash.com/photos/2oJ4eGRPqrE", credit: "Umair Ali Asad / Unsplash", use: "Gulab Jamun" },
] as const;
