# Integration Guide

## AI Model Integration

### Image Generation

#### Option 1: Replicate API
```python
import replicate

def generate_image(prompt: str, seed: int = None):
    output = replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input={
            "prompt": prompt,
            "seed": seed,
            "num_outputs": 1,
            "guidance_scale": 7.5,
            "num_inference_steps": 50
        }
    )
    return output[0]
```

#### Option 2: HuggingFace Inference API
```python
import requests

def generate_image(prompt: str):
    API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"}
    
    response = requests.post(API_URL, headers=headers, json={"inputs": prompt})
    return response.content
```

#### Option 3: Local Model (Stable Diffusion XL)
```python
from diffusers import StableDiffusionXLPipeline
import torch

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")

def generate_image(prompt: str, seed: int = None):
    generator = torch.Generator(device="cuda").manual_seed(seed) if seed else None
    image = pipe(prompt, generator=generator).images[0]
    return image
```

### Vision Encoder (CLIP)

```python
import clip
import torch
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

def encode_image(image_path: str) -> np.ndarray:
    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    with torch.no_grad():
        image_features = model.encode_image(image)
        embedding = image_features.cpu().numpy()[0]
    return embedding
```

## Vector Database Integration

### Pinecone

```python
import pinecone

pinecone.init(api_key=API_KEY, environment=ENVIRONMENT)
index = pinecone.Index("fashion-products")

# Upsert product embeddings
index.upsert([
    (product_id, embedding.tolist(), {"name": product_name, "price": price})
])

# Search
results = index.query(
    vector=query_embedding.tolist(),
    top_k=20,
    include_metadata=True
)
```

### Weaviate

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

# Create schema
schema = {
    "class": "Product",
    "properties": [
        {"name": "name", "dataType": ["string"]},
        {"name": "price", "dataType": ["number"]},
        {"name": "image", "dataType": ["string"]}
    ]
}
client.schema.create_class(schema)

# Add product
client.data_object.create(
    data_object={"name": "Dress", "price": 15000},
    class_name="Product",
    vector=embedding.tolist()
)

# Search
results = client.query.get("Product", ["name", "price"])\
    .with_near_vector({"vector": query_embedding.tolist()})\
    .with_limit(20)\
    .do()
```

## Product Feed Integration

### Marketplace APIs

#### Wildberries API
```python
import requests

def fetch_wildberries_products(category: str):
    url = "https://card.wb.ru/cards/v1/detail"
    params = {"nm": product_id}
    response = requests.get(url, params=params)
    return response.json()
```

#### Ozon API
```python
def fetch_ozon_products(query: str):
    url = "https://api-seller.ozon.ru/v2/product/list"
    headers = {"Client-Id": CLIENT_ID, "Api-Key": API_KEY}
    data = {"filter": {"offer_id": [], "product_id": []}, "limit": 100}
    response = requests.post(url, headers=headers, json=data)
    return response.json()
```

## Image Storage (S3)

```python
import boto3

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def upload_image(image_data: bytes, filename: str) -> str:
    s3_client.upload_fileobj(
        image_data,
        AWS_S3_BUCKET,
        filename,
        ExtraArgs={'ContentType': 'image/png'}
    )
    return f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{filename}"
```
