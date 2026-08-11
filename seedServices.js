const db = require("./config/firebase");

async function seedServices() {

  const services = [

    // CAT001 - Plumbing
    { service_id: "SER001", category_id: "CAT001", service_name: "Tap Repair", base_price: 249 },
    { service_id: "SER002", category_id: "CAT001", service_name: "Pipe Leakage Fix", base_price: 299 },
    { service_id: "SER003", category_id: "CAT001", service_name: "Drain Cleaning", base_price: 349 },

    // CAT002 - Electrician
    { service_id: "SER004", category_id: "CAT002", service_name: "Fan Installation", base_price: 399 },
    { service_id: "SER005", category_id: "CAT002", service_name: "Switch Board Repair", base_price: 249 },
    { service_id: "SER006", category_id: "CAT002", service_name: "Wiring Fix", base_price: 599 },

    // CAT003 - AC Repair
    { service_id: "SER007", category_id: "CAT003", service_name: "AC Servicing", base_price: 999 },
    { service_id: "SER008", category_id: "CAT003", service_name: "AC Gas Refill", base_price: 1999 },
    { service_id: "SER009", category_id: "CAT003", service_name: "AC Installation", base_price: 1499 },

    // CAT004 - Appliance
    { service_id: "SER010", category_id: "CAT004", service_name: "Washing Machine Repair", base_price: 499 },
    { service_id: "SER011", category_id: "CAT004", service_name: "Refrigerator Repair", base_price: 699 },
    { service_id: "SER012", category_id: "CAT004", service_name: "Microwave Repair", base_price: 399 },

    // CAT005 - Carpentry
    { service_id: "SER013", category_id: "CAT005", service_name: "Door Repair", base_price: 599 },
    { service_id: "SER014", category_id: "CAT005", service_name: "Furniture Assembly", base_price: 799 },
    { service_id: "SER015", category_id: "CAT005", service_name: "Window Fixing", base_price: 499 },

    // CAT006 - Home Cleaning
    { service_id: "SER016", category_id: "CAT006", service_name: "Full Home Cleaning", base_price: 2499 },
    { service_id: "SER017", category_id: "CAT006", service_name: "Deep Cleaning", base_price: 2999 },
    { service_id: "SER018", category_id: "CAT006", service_name: "Move-in Cleaning", base_price: 1999 },

    // CAT007 - Kitchen Cleaning
    { service_id: "SER019", category_id: "CAT007", service_name: "Kitchen Deep Cleaning", base_price: 1499 },
    { service_id: "SER020", category_id: "CAT007", service_name: "Chimney Cleaning", base_price: 899 },
    { service_id: "SER021", category_id: "CAT007", service_name: "Gas Stove Cleaning", base_price: 499 },

    // CAT008 - Bathroom Cleaning
    { service_id: "SER022", category_id: "CAT008", service_name: "Bathroom Deep Cleaning", base_price: 799 },
    { service_id: "SER023", category_id: "CAT008", service_name: "Tile Scrubbing", base_price: 699 },
    { service_id: "SER024", category_id: "CAT008", service_name: "Toilet Sanitization", base_price: 499 },

    // CAT009 - Sofa Cleaning
    { service_id: "SER025", category_id: "CAT009", service_name: "Sofa Shampoo Cleaning", base_price: 999 },
    { service_id: "SER026", category_id: "CAT009", service_name: "Cushion Cleaning", base_price: 599 },
    { service_id: "SER027", category_id: "CAT009", service_name: "Fabric Protection", base_price: 799 },

    // CAT010 - Pest Control
    { service_id: "SER028", category_id: "CAT010", service_name: "Cockroach Control", base_price: 999 },
    { service_id: "SER029", category_id: "CAT010", service_name: "Termite Treatment", base_price: 2999 },
    { service_id: "SER030", category_id: "CAT010", service_name: "Mosquito Control", base_price: 799 },

    // CAT011 - Painting
    { service_id: "SER031", category_id: "CAT011", service_name: "Interior Painting", base_price: 5999 },
    { service_id: "SER032", category_id: "CAT011", service_name: "Exterior Painting", base_price: 7999 },
    { service_id: "SER033", category_id: "CAT011", service_name: "Wall Touch-up", base_price: 1499 },

    // CAT012 - Waterproofing
    { service_id: "SER034", category_id: "CAT012", service_name: "Roof Waterproofing", base_price: 6999 },
    { service_id: "SER035", category_id: "CAT012", service_name: "Bathroom Waterproofing", base_price: 3999 },
    { service_id: "SER036", category_id: "CAT012", service_name: "Basement Protection", base_price: 4999 },

    // CAT013 - Furniture
    { service_id: "SER037", category_id: "CAT013", service_name: "Chair Repair", base_price: 399 },
    { service_id: "SER038", category_id: "CAT013", service_name: "Table Repair", base_price: 499 },
    { service_id: "SER039", category_id: "CAT013", service_name: "Wood Polishing", base_price: 999 },

    // CAT014 - Packer & Mover
    { service_id: "SER040", category_id: "CAT014", service_name: "Local Shifting", base_price: 2999 },
    { service_id: "SER041", category_id: "CAT014", service_name: "Intercity Moving", base_price: 7999 },
    { service_id: "SER042", category_id: "CAT014", service_name: "Office Relocation", base_price: 9999 },

    // CAT015 - CCTV Install
    { service_id: "SER043", category_id: "CAT015", service_name: "CCTV Installation", base_price: 2499 },
    { service_id: "SER044", category_id: "CAT015", service_name: "Camera Repair", base_price: 999 },
    { service_id: "SER045", category_id: "CAT015", service_name: "DVR Setup", base_price: 1499 }
  ];

  for (let service of services) {
    await db.collection("SERVICE").doc(service.service_id).set({
      ...service,
      description: service.service_name + " service",
      duration_minutes: 60,
      
    });
  }

  console.log("45 Services Added Successfully");
}

seedServices();