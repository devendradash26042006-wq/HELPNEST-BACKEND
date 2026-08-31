require("dotenv").config();
const express = require("express");
require("./config/firebase");

const app = express();

app.use(express.json());

app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/service", require("./routes/serviceRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/provider", require("./routes/providerRoutes"));
app.use("/api/review", require("./routes/reviewRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/notification", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));




app.get("/", (req, res) => {
  res.send("Help Nest Backend Running");
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
