import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Stripe from 'stripe';
const stripe = Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
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
                "negative_prompt": "painting, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, skinny, glitchy, double torso, extra arms, extra hands, mangled fingers, missing lips, ugly face, distorted face, extra legs, anime, nude, naked, extra face",
                "width": width,
                "height": height,
                "samples": "1",
                "num_inference_steps": "30",
                "safety_checker": "no",
                "enhance_prompt": "yes",
                "seed": null,
                "guidance_scale": 15,
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


const getImageFromText_ = async (prompt, neg_prompt) => {
    try {
        const response = await fetch('https://stablediffusionapi.com/api/v3/text2img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "key": process.env.STABLE_KEY,
                "prompt": prompt,
                "negative_prompt": neg_prompt,
                "width": 720,
                "height": 720,
                "samples": "4",
                "num_inference_steps": "20",
                "seed": 4500,
                "guidance_scale": 7.5,
                "safety_checker": "yes",
                "webhook": null,
                "track_id": null
            }
            )
        });
        const data = await response.json();
        console.log(data);
        return data.output;
    } catch (error) {
        console.log(error);
    }
}

const imageToImage = async (prompt, url) => {
    try {
        const response = await fetch('https://stablediffusionapi.com/api/v3/img2img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "key": process.env.STABLE_KEY,
                "prompt": prompt,
                "negative_prompt": null,
                "init_image": url,
                "width": 1024,
                "height": 1024,
                "samples": "4",
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
        console.log(data);
        return data.output;
    } catch (error) {
        console.log(error);
    }
}


app.post('/api/image/img', async (req, res) => {
    let { prompt, url } = req.body;
    console.log(prompt, url);
    const image = await imageToImage(prompt, url);
    res.json({
        image: image,
    });
});

app.post('/api/image/text', async (req, res) => {
    let { prompt, type } = req.body;
    console.log(prompt, type);
    if (type === 'ARTSY') {
        let temp = 'vaporwave aesthetic, synthwave, colorful, psychedelic, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha'
        prompt = prompt + ', ' + temp;
        let neg_prompt = 'nude, naked, breast, duplicate, double person, double character, disproper body, disproportional body, disfigured, ugly, bad, painting, b&w, double human, double person, duplicate, irregular eyes'
        const artsy = await getImageFromText_(prompt, neg_prompt);
        res.json({
            image: artsy,
        });
        return;
    } else if (type === 'PHOTOSHOOT') {
        let temp = 'rim lighting, studio lighting, posing for shoot, dslr, ultra quality, sharp focus, tack sharp, dof, film grain, Fujifilm XT3, crystal clear, 8K UHD'
        prompt = prompt + ', ' + temp;
        let neg_prompt = 'disfigured, ugly, bad, immature, cartoon, anime, 3d, painting, b&w, double human, double person, duplicate, irregular eyes'
        const photoshoot = await getImageFromText_(prompt, neg_prompt);
        res.json({
            image: photoshoot,
        });
    } else if (type === 'KAWAII') {
        let temp = 'cute, adorable, kawaii, anime, manga, chibi, pastel, pink, purple, blue, green, yellow, orange, red, aesthetic, vaporwave, synthwave, retro, vintage, 80s, 90s, 2000s, 2010s, 2020s, digital art, digital painting, illustration, artstation, concept art, art by artgerm and greg rutkowski and alphonse mucha'
        prompt = prompt + ', ' + temp;
        let neg_prompt = 'disfigured, ugly, bad, immature, cartoon, anime, 3d, painting, b&w, double human, double person, duplicate, irregular eyes'
        const kawaii = await getImageFromText_(prompt, neg_prompt);
        res.json({
            image: kawaii,
        });
        return;
    }
})

app.post('/payment', async (req, res) => {
    const { price } = req.body;
    console.log(price);
    try {
        const session = await stripe.checkout.sessions.create({
            success_url: 'https://sero.pages.dev/',
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        unit_amount: price,
                        currency: 'usd',
                        product_data: {
                            name: 'Test',
                            description: 'Serotech Test Payment\n use 4242424242424242 as card number, 04/24 as expiry date and 242 as CVC',
                        },
                    },
                    quantity: 1,
                },
            ],
            cancel_url: 'https://sero.pages.dev/',
            customer_email: 'abc@byom.de',
        });
        res.json({ url: session.url });
    } catch (error) {
        console.log(error);
    }
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
