import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.JSON2VIDEO_API_KEY;

const JSON2VIDEO_API =
  "https://api.json2video.com/v2/movies";

if (!API_KEY) {
  console.error("JSON2VIDEO_API_KEY မရှိပါ");
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "AI Video Maker Backend is running"
  });
});

app.post("/api/video/create", async (req, res) => {
  try {
    const story = String(req.body.story || "").trim();

    if (!story) {
      return res.status(400).json({
        error: "ဇာတ်လမ်းထည့်ပါ"
      });
    }

    const scenes = [];

    for (let i = 1; i <= 9; i++) {
      scenes.push({
        duration: 10,
        elements: [
          {
            type: "text",
            text: `${story}\n\nScene ${i}`,
            style: "001"
          }
        ]
      });
    }

    const movie = {
      resolution: "full-hd",
      "client-data": {
        title: "AI Video Maker"
      },
      scenes: scenes
    };

    const response = await fetch(JSON2VIDEO_API, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movie)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({
      success: true,
      project: data.project
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.get("/api/video/status/:project", async (req, res) => {
  try {
    const response = await fetch(
      `${JSON2VIDEO_API}?project=${encodeURIComponent(req.params.project)}`,
      {
        headers: {
          "x-api-key": API_KEY
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
