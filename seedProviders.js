const db = require("./config/firebase");

const providers = [
  { id: "SP001", name: "Ramesh Patel", phone: "9000000001", category_id: "CAT001", rating: 4.8 },
  { id: "SP002", name: "Amit Sharma", phone: "9000000002", category_id: "CAT002", rating: 4.9 },
  { id: "SP003", name: "Vikas Rao", phone: "9000000003", category_id: "CAT003", rating: 4.7 },
  { id: "SP004", name: "Sandeep Das", phone: "9000000004", category_id: "CAT004", rating: 4.6 },
  { id: "SP005", name: "Rohit Singh", phone: "9000000005", category_id: "CAT005", rating: 4.8 },
  { id: "SP006", name: "Jami Charitha", phone: "9000000006", category_id: "CAT006", rating: 4.9 },
  { id: "SP007", name: "Balla Srilu", phone: "9000000007", category_id: "CAT007", rating: 4.7 },
  { id: "SP008", name: "Supriya Patro", phone: "9000000008", category_id: "CAT008", rating: 4.6 },
  { id: "SP009", name: "Deepak Kumar", phone: "9000000009", category_id: "CAT009", rating: 4.8 },
  { id: "SP010", name: "Raj Malhotra", phone: "9000000010", category_id: "CAT010", rating: 4.7 },
  { id: "SP011", name: "Manoj Yadav", phone: "9000000011", category_id: "CAT011", rating: 4.9 },
  { id: "SP012", name: "Arjun Naik", phone: "9000000012", category_id: "CAT012", rating: 4.5 },
  { id: "SP013", name: "Suresh Jain", phone: "9000000013", category_id: "CAT013", rating: 4.6 },
  { id: "SP014", name: "Rohit Logistics", phone: "9000000014", category_id: "CAT014", rating: 4.8 },
  { id: "SP015", name: "TechSecure Team", phone: "9000000015", category_id: "CAT015", rating: 4.7 }
];

async function seedProviders() {
  for (const p of providers) {
    await db.collection("SERVICE_PROVIDER").doc(p.id).set({
      name: p.name,
      phone: p.phone,
      category_id: p.category_id,
      rating: p.rating,
      is_active: true
    });
  }

  console.log("Providers seeded successfully");
  process.exit();
}

seedProviders();