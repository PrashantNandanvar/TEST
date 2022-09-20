const express = require("express");
const app = express();
const admin = require("firebase-admin");
const credentials = require("./key.json");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/getProducts", async (req, res) => {
  var arr = [];
  const citiesRef = db.collection("products");
  const snapshot = await citiesRef.get();
  if (snapshot) {
    snapshot.forEach((doc) => {
      arr.push(doc.data());
    });
    res.status(200).json({
      data: arr,
    });
  } else {
    res.status(400).json({
      message: "No result",
    });
  }
});

app.post("/addProduct", async (req, res) => {
  const citiesRef = db.collection("products");
  const snapshot = await citiesRef.get();
  var check;
  console.log(snapshot._size);
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data().length);
    check = doc.id;
  });
  check = parseInt(check) + 1;
  console.log(check);
  const userJson = {
    id: check,
    title: req.body.title,
    price: req.body.price,
    category: req.body.category,
    description: req.body.description,
    image: req.body.image,
  };

  console.log(userJson);

  await db.collection("products").doc(check.toString()).set(userJson);
  res.status(200).json({
    message: "Data Added",
    data: userJson,
  });
});

app.put("/updateProduct/:id", async (req, res) => {
  var id = req.params.id;
  const userJson = {
    title: req.body.title,
    price: req.body.price,
    category: req.body.category,
    description: req.body.description,
    image: req.body.image,
  };

  var response = await db.collection("products").doc(id).update(userJson);
  console.log(response);
  if (response) {
    res
      .status(200)
      .json({ result: 1, message: "Data Updated", data: userJson });
  } else {
    res.status(400).json({ result: 0, message: "Data not Updated" });
  }
});

app.delete("/deleteProduct/:id", async (req, res) => {
  var id = req.params.id;
  const cityRef = db.collection("cities").doc(id);
  const doc = await cityRef.get();
  if (!doc.exists) {
    res.status(400).json({ result: 0, message: "no product to delete" });
  } else {
    console.log("Document data:", doc.data());
    const itemDelete = await db.collection("products").doc(id).delete();
    res
      .status(200)
      .json({ result: 1, message: "product deleted successfully" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
