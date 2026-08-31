const db = require("./config/firebase");

async function seedCategories() {

  const categories = [
    { category_id: "CAT001", name: "Plumbing" },
    { category_id: "CAT002", name: "Electrician" },
    { category_id: "CAT003", name: "AC Repair" },
    { category_id: "CAT004", name: "Appliance" },
    { category_id: "CAT005", name: "Carpentry" },
    { category_id: "CAT006", name: "Home Cleaning" },
    { category_id: "CAT007", name: "Kitchen Cleaning" },
    { category_id: "CAT008", name: "Bathroom Cleaning" },
    { category_id: "CAT009", name: "Sofa Cleaning" },
    { category_id: "CAT010", name: "Pest Control" },
    { category_id: "CAT011", name: "Painting" },
    { category_id: "CAT012", name: "Waterproofing" },
    { category_id: "CAT013", name: "Furniture" },
    { category_id: "CAT014", name: "Packer & Mover" },
    { category_id: "CAT015", name: "CCTV Install" }
  ];

  for (let category of categories) {
    await db.collection("CATEGORY").doc(category.category_id).set(category);
  }

  console.log("15 Categories Added Successfully");
}

seedCategories();