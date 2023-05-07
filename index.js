import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/image/text', async (req, res) => {

    try {
        let { prompt, width, height, type } = req.body;
        const imagePromt = `Generate an image of a ${type} with the text "${prompt}"`
        if (width > 1080 || height > 1080) {
            width = 1080;
            height = 1080;
        }
        const response = await fetch('https://stablediffusionapi.com/api/v3/text2img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "key": process.env.STABLE_KEY,
                "prompt": imagePromt,
                "negative_prompt": "((out of frame)), ((extra fingers)), mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), (((tiling))), ((naked)), ((tile)), ((fleshpile)), ((ugly)), (((abstract))), blurry, ((bad anatomy)), ((bad proportions)), ((extra limbs)), cloned face, (((skinny))), glitchy, ((extra breasts)), ((double torso)), ((extra arms)), ((extra hands)), ((mangled fingers)), ((missing breasts)), (missing lips), ((ugly face)), ((fat)), ((extra legs)), anime",
                "width": width,
                "height": height,
                "samples": "1",
                "num_inference_steps": "20",
                "seed": null,
                "guidance_scale": 7.5,
                "safety_checker": "yes",
                "webhook": null,
                "track_id": null
            })
        });
        const data = await response.json();
        console.log(data);
        res.send({
            image: data.output
        })
    } catch (error) {
        console.log(error);
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
