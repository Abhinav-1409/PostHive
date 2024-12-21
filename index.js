const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const userRoutes = require("./routes/user");

app.get("/", (req, res) => {
  res.render("homepage", {
    posts: [
      {
        _id: "64d2f9f7b3e1e647b0a2c7f9",
        user: {
          _id: "64d2f9e8b3e1e647b0a2c7f1",
          name: "John Doe",
          email: "john.doe@example.com",
        },
        title: "Exploring the Beauty of Nature",
        content:
          "Here's an amazing view I captured during my weekend hike. Nature never ceases to amaze me!",
        media: {
          type: "image",
          url: "/uploads/nature-hike.jpg",
          thumbnail: null,
        },
        likes: 24,
        comments: [
          {
            user: {
              _id: "64d2f9e8b3e1e647b0a2c7f2",
              name: "Jane Smith",
            },
            text: "This is absolutely stunning! Where was this taken?",
            createdAt: "2024-12-18T10:15:00Z",
          },
          {
            user: {
              _id: "64d2f9e8b3e1e647b0a2c7f3",
              name: "Alice Johnson",
            },
            text: "Nature is so peaceful. Thanks for sharing!",
            createdAt: "2024-12-18T11:30:00Z",
          },
        ],
        shares: 3,
        createdAt: "2024-12-18T09:45:00Z",
      },
    ],
  });
});

app.use('/user',userRoutes);

app.listen(8000, () => {
  console.log("Server Started at PORT 8000");
});
