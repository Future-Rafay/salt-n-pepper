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
