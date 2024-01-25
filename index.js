const express = require("express");
const app = express();
const PORT = 3001;
const path = require("path");
const fs = require("fs");
const pathToFile = path.resolve("./data.json");

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello home");
});

app.get("/api/resource", (req, res) => {
  const resouces = getResources();
  res.send(resouces);
});

app.get("/api/resource/activeresource", (req, res) => {
  const resouces = getResources();
  const activeResouces = resouces.find(
    (resouce) => resouce.status === "active"
  );
  res.send(activeResouces);
});
app.get("/api/resource/:id", (req, res) => {
  let resouces = getResources();
  const { id } = req.params;

  resouces = resouces.find((resource) => resource.id === id);
  res.send(resouces);
});
app.patch("/api/resource/:id/edit", (req, res) => {
  let resouces = getResources();
  const { id } = req.params;
  const index = resouces.findIndex((resource) => resource.id === id);
  const activeResouces = resouces.find(
    (resouce) => resouce.status === "active"
  );
  if (resouces[index].status === "complete") {
    return res
      .status(422)
      .send("Cannot update because resource has been completed!");
  }

  resouces[index] = req.body;

  if (req.body.status === "active") {
    if (activeResouces) {
      return res.send("there is active resouces already").status(422);
    }

    resouces[index].status = "active";
    resouces[index].activationTime = new Date();
  }
  fs.writeFile(pathToFile, JSON.stringify(resouces, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }

    return res.send("Data has been saved!");
  });
  res.send(resouces);
});

app.post("/api/resource/new", (req, res) => {
  const resouces = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();
  resouces.unshift(resource);
  fs.writeFile(pathToFile, JSON.stringify(resouces, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }

    return res.send("Data has been saved!");
  });
});

app.listen(PORT, () => {
  console.log("server is on in port:" + PORT);
});
