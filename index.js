import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

const getImageFromText = async (prompt, width, height, modelid) => {
    try {
        const response = await fetch('https://stablediffusionapi.com/api/v3/dreambooth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "key": process.env.STABLE_KEY,
                "model_id": modelid,
                "prompt": prompt,
                "negative_prompt": "(deformed iris, deformed pupils, semi-realistic, naked, nude, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, painting, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, skinny, glitchy, double torso, extra arms, extra hands, mangled fingers, missing lips, ugly face, distorted face, extra legs, anime",
                "width": width,
                "height": height,
                "samples": "1",
                "num_inference_steps": "30",
                "safety_checker": "no",
                "enhance_prompt": "yes",
                "seed": null,
                "guidance_scale": 7.5,
                "webhook": null,
                "track_id": null
            })
        });
        const data = await response.json();
        console.log(data);
        return data.output;
    } catch (error) {
        console.log(error);
    }
}

const imageToImage = async (prompt, width, height) => {
    try {
        const response = await fetch('https://stablediffusionapi.com/api/v3/img2img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "key": "",
                "prompt": prompt,
                "negative_prompt": null,
                "init_image": null,
                "width": width,
                "height": height,
                "samples": "1",
                "num_inference_steps": "30",
                "guidance_scale": 7.5,
                "safety_checker":"yes",
                "strength": 0.7,
                "seed": null,
                "webhook": null,
                "track_id": null
            })
        });
        const data = await response.json();
        console.log('Image Success');
        return data.output;
    } catch (error) {
        console.log(error);
    }
}

app.post('/api/image/img', async (req, res) => {
    console.log(req.body);
    res.json('Success');
})

app.post('/api/image/text', async (req, res) => {
    let { prompt, width, height, type } = req.body;
    let modelid = null;
    if (type === 'ARTSY') {
        modelid = 'midjourney';
    } else if (type === 'PHOTOSHOOT') {
        modelid = 'realistic-vision-v13';
    } else if (type === 'KAWAII') {
        modelid = 'anything-v4'
    }

    const imagePromt = `Generate an image of a ${type} of "${prompt}"`

    if (width > 1080 || height > 1080) {
        width = 1080;
        height = 1080;
    }
    const image = await getImageFromText(imagePromt, width, height, modelid);
    res.json({ 
        image: image,
    });
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
