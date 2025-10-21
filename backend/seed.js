import {db} from "./drizzle/index.js";
import {products, categories, brands} from "./drizzle/schema/schema.js";

const seedData = async () => {
  try {
    console.log("🌱 Starting seed data generation...");

    // Clear existing data
    await db.delete(products);
    await db.delete(categories);
    await db.delete(brands);

    // Insert categories
    const categoryData = [
      {name: "Flooring"},
      {name: "Wall"},
      {name: "Bathroom"},
      {name: "Kitchen"},
      {name: "Outdoor"},
      {name: "Commercial"},
    ];

    const insertedCategories = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert brands
    const brandData = [
      {name: "WoodTech"},
      {name: "CeramicPro"},
      {name: "InteriorMax"},
      {name: "LuxuryTiles"},
      {name: "AquaTile"},
      {name: "KitchenPro"},
      {name: "OutdoorMax"},
      {name: "GlassCraft"},
      {name: "StoneCraft"},
      {name: "VinylPro"},
      {name: "ArtTile"},
      {name: "PorcelainMax"},
      {name: "QuartzMax"},
      {name: "ClassicTile"},
      {name: "NaturalStone"},
      {name: "ModernTile"},
      {name: "LuxuryStone"},
      {name: "HandCraft"},
      {name: "MetalCraft"},
      {name: "EcoTile"},
    ];

    const insertedBrands = await db
      .insert(brands)
      .values(brandData)
      .returning();
    console.log(`✅ Inserted ${insertedBrands.length} brands`);

    // Create mapping objects for categories and brands
    const categoryMap = {};
    const brandMap = {};

    insertedCategories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    insertedBrands.forEach((brand) => {
      brandMap[brand.name] = brand.id;
    });

    // Product data
    const productData = [
      {
        categoryId: categoryMap["Flooring"],
        brandId: brandMap["WoodTech"],
        name: "Premium Oak Wood Tile",
        description:
          "High-quality oak wood tile with natural wood grain and texture. Perfect for living rooms and bedrooms.",
        price: "299.99",
        discount: true,
        discountPrice: "239.99",
        stock: 50,
        sold: 150,
        thumbnail: "/images/wood-tile.jpg",
        images: JSON.stringify([
          "/images/wood-tile.jpg",
          "/images/interior-tile.jpg",
        ]),
        rating: "4.8",
        isNew: false,
        isBestSeller: true,
        isTopRated: true,
        isOnSale: true,
        isTrending: true,
        isHot: false,
        isFeatured: true,
        numReviews: 324,
      },
      {
        categoryId: categoryMap["Flooring"],
        brandId: brandMap["CeramicPro"],
        name: "Durable Ceramic Tile",
        description:
          "Durable ceramic tile perfect for bathrooms and kitchens. Water-resistant and easy to clean.",
        price: "199.99",
        discount: true,
        discountPrice: "169.99",
        stock: 75,
        sold: 200,
        thumbnail: "/images/white-tile.jpg",
        images: JSON.stringify([
          "/images/white-tile.jpg",
          "/images/interior-tile.jpg",
        ]),
        rating: "4.6",
        isNew: true,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: true,
        isTrending: false,
        isHot: false,
        isFeatured: false,
        numReviews: 156,
      },
      {
        categoryId: categoryMap["Wall"],
        brandId: brandMap["InteriorMax"],
        name: "Modern Interior Tile",
        description:
          "Modern interior tile with sleek design for contemporary spaces. Perfect for accent walls.",
        price: "249.99",
        discount: false,
        discountPrice: null,
        stock: 30,
        sold: 80,
        thumbnail: "/images/interior-tile.jpg",
        images: JSON.stringify([
          "/images/interior-tile.jpg",
          "/images/wood-tile.jpg",
        ]),
        rating: "4.9",
        isNew: false,
        isBestSeller: false,
        isTopRated: true,
        isOnSale: false,
        isTrending: true,
        isHot: true,
        isFeatured: true,
        numReviews: 89,
      },
      {
        categoryId: categoryMap["Flooring"],
        brandId: brandMap["LuxuryTiles"],
        name: "Luxurious Marble Tile",
        description:
          "Luxurious marble tile for premium interior design. Natural stone with unique veining patterns.",
        price: "399.99",
        discount: true,
        discountPrice: "299.99",
        stock: 20,
        sold: 45,
        thumbnail: "/images/wood-tile.jpg",
        images: JSON.stringify([
          "/images/wood-tile.jpg",
          "/images/white-tile.jpg",
        ]),
        rating: "4.7",
        isNew: false,
        isBestSeller: true,
        isTopRated: false,
        isOnSale: true,
        isTrending: false,
        isHot: false,
        isFeatured: false,
        numReviews: 67,
      },
      {
        categoryId: categoryMap["Bathroom"],
        brandId: brandMap["AquaTile"],
        name: "Water-Resistant Bathroom Tile",
        description:
          "Water-resistant tile specifically designed for bathrooms. Mold and mildew resistant.",
        price: "149.99",
        discount: true,
        discountPrice: "134.99",
        stock: 100,
        sold: 300,
        thumbnail: "/images/white-tile.jpg",
        images: JSON.stringify([
          "/images/white-tile.jpg",
          "/images/interior-tile.jpg",
        ]),
        rating: "4.5",
        isNew: true,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: true,
        isTrending: true,
        isHot: false,
        isFeatured: false,
        numReviews: 234,
      },
      {
        categoryId: categoryMap["Kitchen"],
        brandId: brandMap["KitchenPro"],
        name: "Stylish Kitchen Backsplash",
        description:
          "Stylish backsplash tile for modern kitchen designs. Heat and stain resistant.",
        price: "179.99",
        discount: false,
        discountPrice: null,
        stock: 60,
        sold: 120,
        thumbnail: "/images/interior-tile.jpg",
        images: JSON.stringify([
          "/images/interior-tile.jpg",
          "/images/wood-tile.jpg",
        ]),
        rating: "4.8",
        isNew: false,
        isBestSeller: false,
        isTopRated: true,
        isOnSale: false,
        isTrending: false,
        isHot: true,
        isFeatured: true,
        numReviews: 98,
      },
      {
        category: "Outdoor",
        brand: "OutdoorMax",
        name: "Weather-Resistant Outdoor Tile",
        description:
          "Weather-resistant tile perfect for outdoor spaces. UV resistant and slip-resistant.",
        price: "219.99",
        discount: true,
        discountPrice: "175.99",
        stock: 40,
        sold: 90,
        thumbnail: "/images/wood-tile.jpg",
        images: JSON.stringify([
          "/images/wood-tile.jpg",
          "/images/white-tile.jpg",
        ]),
        rating: "4.4",
        isNew: false,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: true,
        isTrending: true,
        isHot: false,
        isFeatured: false,
        numReviews: 76,
      },
      {
        category: "Wall",
        brand: "GlassCraft",
        name: "Elegant Glass Tile",
        description:
          "Elegant glass tile for contemporary interior design. Reflective and modern.",
        price: "329.99",
        discount: false,
        discountPrice: null,
        stock: 25,
        sold: 55,
        thumbnail: "/images/white-tile.jpg",
        images: JSON.stringify([
          "/images/white-tile.jpg",
          "/images/interior-tile.jpg",
        ]),
        rating: "4.9",
        isNew: true,
        isBestSeller: false,
        isTopRated: true,
        isOnSale: false,
        isTrending: false,
        isHot: true,
        isFeatured: true,
        numReviews: 45,
      },
      {
        category: "Flooring",
        brand: "StoneCraft",
        name: "Premium Granite Tile",
        description:
          "Premium granite tile with natural stone patterns. Durable and elegant.",
        price: "449.99",
        discount: true,
        discountPrice: "314.99",
        stock: 15,
        sold: 35,
        thumbnail: "/images/wood-tile.jpg",
        images: JSON.stringify([
          "/images/wood-tile.jpg",
          "/images/white-tile.jpg",
        ]),
        rating: "4.7",
        isNew: false,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: true,
        isTrending: true,
        isHot: false,
        isFeatured: false,
        numReviews: 28,
      },
      {
        category: "Flooring",
        brand: "VinylPro",
        name: "Durable Vinyl Tile",
        description:
          "Durable vinyl tile perfect for high-traffic areas. Easy to install and maintain.",
        price: "89.99",
        discount: false,
        discountPrice: null,
        stock: 200,
        sold: 500,
        thumbnail: "/images/interior-tile.jpg",
        images: JSON.stringify([
          "/images/interior-tile.jpg",
          "/images/wood-tile.jpg",
        ]),
        rating: "4.3",
        isNew: true,
        isBestSeller: true,
        isTopRated: false,
        isOnSale: false,
        isTrending: false,
        isHot: false,
        isFeatured: false,
        numReviews: 189,
      },
      {
        category: "Wall",
        brand: "ArtTile",
        name: "Artistic Mosaic Tile",
        description:
          "Artistic mosaic tile for decorative wall applications. Handcrafted with unique patterns.",
        price: "159.99",
        discount: true,
        discountPrice: "135.99",
        stock: 40,
        sold: 85,
        thumbnail: "/images/white-tile.jpg",
        images: JSON.stringify([
          "/images/white-tile.jpg",
          "/images/interior-tile.jpg",
        ]),
        rating: "4.6",
        isNew: false,
        isBestSeller: false,
        isTopRated: true,
        isOnSale: true,
        isTrending: true,
        isHot: false,
        isFeatured: true,
        numReviews: 67,
      },
      {
        category: "Flooring",
        brand: "PorcelainMax",
        name: "High-Quality Porcelain Tile",
        description:
          "High-quality porcelain tile with excellent durability. Perfect for commercial and residential use.",
        price: "279.99",
        discount: false,
        discountPrice: null,
        stock: 60,
        sold: 120,
        thumbnail: "/images/wood-tile.jpg",
        images: JSON.stringify([
          "/images/wood-tile.jpg",
          "/images/white-tile.jpg",
        ]),
        rating: "4.8",
        isNew: false,
        isBestSeller: true,
        isTopRated: true,
        isOnSale: false,
        isTrending: false,
        isHot: true,
        isFeatured: false,
        numReviews: 95,
      },
      {
        category: "Flooring",
        brand: "QuartzMax",
        name: "Engineered Quartz Tile",
        description:
          "Engineered quartz tile with superior durability and stain resistance. Low maintenance.",
        price: "369.99",
        discount: true,
        discountPrice: "295.99",
        stock: 35,
        sold: 75,
        thumbnail: "/images/interior-tile.jpg",
        images: JSON.stringify([
          "/images/interior-tile.jpg",
          "/images/white-tile.jpg",
        ]),
        rating: "4.9",
        isNew: false,
        isBestSeller: false,
        isTopRated: true,
        isOnSale: true,
        isTrending: true,
        isHot: false,
        isFeatured: true,
        numReviews: 42,
      },
      {
        category: "Wall",
        brand: "ClassicTile",
        name: "Classic Subway Tile",
        description:
          "Classic subway tile perfect for kitchen backsplashes and bathrooms. Timeless design.",
        price: "129.99",
        discount: false,
        discountPrice: null,
        stock: 150,
        sold: 300,
        thumbnail: "/images/white-tile.jpg",
        images: JSON.stringify([
          "/images/white-tile.jpg",
          "/images/wood-tile.jpg",
        ]),
        rating: "4.5",
        isNew: true,
        isBestSeller: true,
        isTopRated: false,
        isOnSale: false,
        isTrending: false,
        isHot: false,
        isFeatured: false,
        numReviews: 156,
      },
      {
        category: "Flooring",
        brand: "NaturalStone",
        name: "Natural Slate Tile",
        description:
          "Natural slate tile with unique texture and color variations. Each piece is unique.",
        price: "199.99",
        discount: true,
        discountPrice: "149.99",
        stock: 25,
        sold: 60,
        thumbnail: "/images/wood-tile.jpg",
        images: JSON.stringify([
          "/images/wood-tile.jpg",
          "/images/interior-tile.jpg",
        ]),
        rating: "4.4",
        isNew: false,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: true,
        isTrending: true,
        isHot: false,
        isFeatured: false,
        numReviews: 38,
      },
      {
        category: "Wall",
        brand: "ModernTile",
        name: "Modern Hexagon Tile",
        description:
          "Modern hexagon tile for contemporary interior design. Geometric patterns for modern spaces.",
        price: "179.99",
        discount: false,
        discountPrice: null,
        stock: 80,
        sold: 140,
        thumbnail: "/images/interior-tile.jpg",
        images: JSON.stringify([
          "/images/interior-tile.jpg",
          "/images/white-tile.jpg",
        ]),
        rating: "4.7",
        isNew: true,
        isBestSeller: false,
        isTopRated: true,
        isOnSale: false,
        isTrending: true,
        isHot: true,
        isFeatured: true,
        numReviews: 89,
      },
      {
        category: "Flooring",
        brand: "LuxuryStone",
        name: "Luxurious Travertine Tile",
        description:
          "Luxurious travertine tile with natural stone beauty. Perfect for high-end projects.",
        price: "319.99",
        discount: true,
        discountPrice: "271.99",
        stock: 20,
        sold: 45,
        thumbnail: "/images/white-tile.jpg",
        images: JSON.stringify([
          "/images/white-tile.jpg",
          "/images/wood-tile.jpg",
        ]),
        rating: "4.8",
        isNew: false,
        isBestSeller: true,
        isTopRated: true,
        isOnSale: true,
        isTrending: false,
        isHot: false,
        isFeatured: false,
        numReviews: 31,
      },
      {
        category: "Flooring",
        brand: "HandCraft",
        name: "Handcrafted Cement Tile",
        description:
          "Handcrafted cement tile with unique patterns and colors. Artisan-made with traditional techniques.",
        price: "149.99",
        discount: false,
        discountPrice: null,
        stock: 45,
        sold: 90,
        thumbnail: "/images/wood-tile.jpg",
        images: JSON.stringify([
          "/images/wood-tile.jpg",
          "/images/interior-tile.jpg",
        ]),
        rating: "4.6",
        isNew: false,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: false,
        isTrending: true,
        isHot: true,
        isFeatured: true,
        numReviews: 67,
      },
      {
        category: "Wall",
        brand: "MetalCraft",
        name: "Sleek Metal Tile",
        description:
          "Sleek metal tile for modern industrial design. Durable and contemporary.",
        price: "239.99",
        discount: true,
        discountPrice: "215.99",
        stock: 30,
        sold: 55,
        thumbnail: "/images/interior-tile.jpg",
        images: JSON.stringify([
          "/images/interior-tile.jpg",
          "/images/white-tile.jpg",
        ]),
        rating: "4.3",
        isNew: true,
        isBestSeller: false,
        isTopRated: false,
        isOnSale: true,
        isTrending: false,
        isHot: false,
        isFeatured: false,
        numReviews: 24,
      },
      {
        category: "Flooring",
        brand: "EcoTile",
        name: "Eco-Friendly Bamboo Tile",
        description:
          "Eco-friendly bamboo tile for sustainable flooring. Renewable and environmentally conscious.",
        price: "189.99",
        discount: false,
        discountPrice: null,
        stock: 60,
        sold: 120,
        thumbnail: "/images/white-tile.jpg",
        images: JSON.stringify([
          "/images/white-tile.jpg",
          "/images/wood-tile.jpg",
        ]),
        rating: "4.7",
        isNew: false,
        isBestSeller: true,
        isTopRated: true,
        isOnSale: false,
        isTrending: true,
        isHot: true,
        isFeatured: true,
        numReviews: 78,
      },
    ];

    const insertedProducts = await db
      .insert(products)
      .values(productData)
      .returning();
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    console.log("🎉 Seed data generation completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - Brands: ${insertedBrands.length}`);
    console.log(`   - Products: ${insertedProducts.length}`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};

// Run the seed function
seedData()
  .then(() => {
    console.log("✅ Database seeded successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to seed database:", error);
    process.exit(1);
  });
