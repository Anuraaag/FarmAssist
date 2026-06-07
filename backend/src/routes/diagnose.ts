import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
});

const PROMPT = `You are an expert agronomist specializing in crop disease diagnosis for Indian farmers. Analyze the uploaded crop leaf image and respond ONLY with a valid JSON object. No markdown, no explanation, just raw JSON.

{
  "disease_name": "string — common name of the disease, or 'Healthy' if no disease detected",
  "scientific_name": "string — scientific name, or empty string if healthy",
  "confidence": "High | Medium | Low",
  "severity": "None | Early | Moderate | Severe",
  "affected_crops": ["array of crop types this disease commonly affects"],
  "organic_treatment": "string — 2-3 sentence practical organic remedy",
  "chemical_treatment": "string — 2-3 sentence chemical treatment with generic compound names",
  "isolate_plant": true | false,
  "additional_notes": "string — one practical tip for the farmer"
}`;

function uploadMiddleware(req: Request, res: Response, next: NextFunction): void {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'Image exceeds 5MB size limit' });
      return;
    }
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}

async function diagnoseHandler(req: Request, res: Response): Promise<void> {
  if (!process.env.GROQ_API_KEY) {
    res.status(500).json({ error: 'Server configuration error: missing API key' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' });
    return;
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const base64Image = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: 'text',
              text: PROMPT,
            },
          ],
        },
      ],
    });

    const rawText = (response.choices[0].message.content ?? '').trim();
    const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    try {
      const diagnosis = JSON.parse(jsonText);
      res.json(diagnosis);
    } catch {
      res.status(422).json({ error: 'Could not parse diagnosis' });
    }
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
}

router.post('/', uploadMiddleware, diagnoseHandler);

export default router;
