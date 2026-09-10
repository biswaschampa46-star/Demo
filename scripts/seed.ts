import "dotenv/config";
import { db } from "../src/db";
import { products } from "../src/db/schema";

const CATALOGUE = [
  {
    slug: "echo-wireless-headphones",
    name: "Echo Wireless Headphones",
    price: 6900,
    compareAtPrice: 7900,
    image: "/images/products/headphones.jpg",
    isFeatured: true,
    isNew: true,
    description:
      "Matte midnight over-ears with a soft memory fit â€” made for long, quiet listening sessions at home or on the road.",
    material: "Matte polymer shell, protein-leather cushions, padded headband. Wipe clean with a dry cloth.",
    variants: [{ name: "Color", options: ["Midnight", "Fog"] }],
  },
  {
    slug: "atlas-day-backpack",
    name: "Atlas Day Backpack",
    price: 4600,
    compareAtPrice: null,
    image: "/images/products/backpack.jpg",
    isFeatured: true,
    isNew: true,
    description:
      "A structured day pack in waxed canvas. One main compartment, one laptop sleeve, nothing you don't need.",
    material: "Waxed cotton canvas, matte black hardware, cotton twill lining. Spot clean only.",
    variants: [{ name: "Color", options: ["Navy", "Black"] }],
  },
  {
    slug: "halo-ceramic-mug",
    name: "Halo Ceramic Mug",
    price: 950,
    compareAtPrice: 1150,
    image: "/images/products/mug.jpg",
    isFeatured: true,
    isNew: false,
    description:
      "A weighty stoneware mug with an ink-blue glaze that deepens at the rim. Comfortable handle, honest 300 ml pour.",
    material: "Glazed stoneware. Dishwasher and microwave safe.",
    variants: [{ name: "Color", options: ["Midnight", "Fog", "Sand"] }],
  },
  {
    slug: "lowtide-scented-candle",
    name: "Lowtide Scented Candle",
    price: 1250,
    compareAtPrice: null,
    image: "/images/products/candle.jpg",
    isFeatured: true,
    isNew: false,
    description:
      "A slow-burning candle in a smoked indigo glass vessel. Quiet, coastal scents â€” nothing loud.",
    material: "Soy-blend wax, cotton wick, smoked glass vessel. Approx. 40-hour burn time. Trim wick before each use.",
    variants: [{ name: "Scent", options: ["Driftwood", "Rain", "Fig"] }],
  },
  {
    slug: "vista-sunglasses",
    name: "Vista Sunglasses",
    price: 2400,
    compareAtPrice: 2950,
    image: "/images/products/sunglasses.jpg",
    isFeatured: true,
    isNew: false,
    description:
      "Translucent slate frames with a soft cat-eye line. Light on the face, easy with everything.",
    material: "Acetate frame, tinted UV-protective lenses. Ships in a hard case with cleaning cloth.",
    variants: [{ name: "Frame", options: ["Slate", "Smoke"] }],
  },
  {
    slug: "stillwater-journal-set",
    name: "Stillwater Journal Set",
    price: 780,
    compareAtPrice: null,
    image: "/images/products/journal.jpg",
    isFeatured: false,
    isNew: true,
    description:
      "Two linen-bound journals â€” one fog, one midnight â€” with lay-flat stitching and unlined cream paper.",
    material: "Linen cover, 96 unlined pages each, sewn binding. Keep dry.",
    variants: [{ name: "Set", options: ["Set of 2", "Set of 3"] }],
  },
  {
    slug: "orb-desk-lamp",
    name: "Orb Desk Lamp",
    price: 3200,
    compareAtPrice: null,
    image: "/images/products/lamp.jpg",
    isFeatured: false,
    isNew: false,
    description:
      "A sculptural dome lamp with a warm, dimmable glow â€” the corner of the room that always feels finished.",
    material: "Powder-coated steel dome, weighted oak base, fabric cable. E14 bulb included.",
    variants: [{ name: "Finish", options: ["Sand", "Charcoal"] }],
  },
  {
    slug: "meridian-canvas-tote",
    name: "Meridian Canvas Tote",
    price: 1650,
    compareAtPrice: null,
    image: "/images/products/tote.jpg",
    isFeatured: false,
    isNew: false,
    description:
      "A carry-everything tote in heavy natural canvas with midnight webbing handles. Inner pocket for the small things.",
    material: "16oz cotton canvas, cotton webbing handles. Hand wash cold, line dry.",
    variants: [{ name: "Handles", options: ["Ink", "Natural"] }],
  },
];

async function main() {
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) {
    console.log("products table already seeded â€” skipping");
    return;
  }
  await db.insert(products).values(CATALOGUE);
  console.log(`seeded ${CATALOGUE.length} products`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
