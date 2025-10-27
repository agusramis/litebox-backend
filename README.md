# Lite-box Related Posts API

A production-ready NestJS backend for managing related posts with image uploads to AWS S3 and PostgreSQL storage.

## 🏗️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (AWS RDS/Aurora Serverless v2)
- **ORM**: Prisma
- **Storage**: AWS S3 (for images)
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Docker, AWS Elastic Beanstalk, or ECS Fargate

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   ├── config/                          # Configuration management
│   │   ├── config.module.ts
│   │   └── config.service.ts
│   ├── common/                          # Shared resources
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── providers/s3/                    # AWS S3 integration
│   │   ├── s3.module.ts
│   │   └── s3.service.ts
│   ├── modules/related-posts/           # Related posts feature
│   │   ├── related-posts.module.ts
│   │   ├── related-posts.controller.ts
│   │   ├── related-posts.service.ts
│   │   ├── related-posts.repository.ts
│   │   ├── dto/
│   │   │   ├── create-related-post.dto.ts
│   │   │   └── query-related-posts.dto.ts
│   │   └── entities/
│   │       └── related-post.entity.ts
│   └── prisma/                          # Database schema
│       ├── schema.prisma
│       └── seed.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose (for local PostgreSQL)
- AWS Account with S3 and RDS access
- npm or yarn

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory (or use `.env.example` as template):

```bash
# App Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database (PostgreSQL)
# Local development:
DATABASE_URL=postgresql://litebox:litebox@localhost:5432/litebox?schema=public

# Production (AWS RDS):
# DATABASE_URL=postgresql://USER:PASSWORD@RDS_ENDPOINT:5432/DB_NAME?schema=public&sslmode=require

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# S3 Configuration
S3_BUCKET=your-s3-bucket-name
# Optional: Use CloudFront for CDN
# S3_PUBLIC_BASE_URL=https://your-distribution.cloudfront.net

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB
```

### 3. Local Development with Docker

Start PostgreSQL database:

```bash
docker-compose up -d
```

This will start a PostgreSQL instance on `localhost:5432` with credentials:

- Username: `litebox`
- Password: `litebox`
- Database: `litebox`

### 4. Database Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Optional - Seed database:

```bash
npm run prisma:seed
```

### 5. Run the Application

Development mode with hot-reload:

```bash
npm run start:dev
```

The API will be available at:

- API: http://localhost:3001
- Swagger Docs: http://localhost:3001/docs

### 6. Testing the API

Use the Swagger UI at http://localhost:3001/docs or test with curl:

**Get Related Posts:**

```bash
curl http://localhost:3001/api/posts/related?limit=3
```

**Create Related Post:**

```bash
curl -X POST http://localhost:3001/api/post/related \
  -F "title=My Amazing Post" \
  -F "image=@/path/to/image.jpg"
```

## 📚 API Endpoints

### GET `/api/posts/related`

Retrieve a list of related posts ordered by creation date (newest first).

**Query Parameters:**

- `limit` (optional): Number of posts to return (1-12, default: 3)

**Response:**

```json
[
  {
    "id": 1,
    "title": "Getting Started with AWS Lambda",
    "imageUrl": "https://your-cdn.com/lite-box/2025-10-21/uuid.jpg",
    "createdAt": "2025-10-21T10:30:00.000Z"
  }
]
```

### POST `/api/post/related`

Create a new related post with image upload.

**Content-Type:** `multipart/form-data`

**Body Parameters:**

- `title` (required): String, 2-200 characters
- `image` (required): File, max 5MB, image/\* only

**Response:** (201 Created)

```json
{
  "id": 1,
  "title": "Getting Started with AWS Lambda",
  "imageUrl": "https://your-cdn.com/lite-box/2025-10-21/uuid.jpg",
  "createdAt": "2025-10-21T10:30:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: Missing or invalid data
- `415 Unsupported Media Type`: File is not an image

## 🔐 AWS Setup

### S3 Bucket Configuration

1. Create an S3 bucket in your AWS region
2. Configure bucket policy or use IAM roles for access
3. (Optional) Set up CloudFront distribution for CDN

### Minimal IAM Policy for S3

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:AbortMultipartUpload", "s3:ListBucketMultipartUploads"],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

### RDS/Aurora PostgreSQL Setup

1. Create a PostgreSQL instance in RDS or Aurora Serverless v2
2. Configure security groups to allow connections from your application
3. Enable SSL mode (recommended for production)
4. Update `DATABASE_URL` in your `.env` with the connection string

**Example RDS Connection String:**

```
postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/database?schema=public&sslmode=require
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t litebox-api .
```

### Run Docker Container

```bash
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e AWS_REGION="us-east-1" \
  -e AWS_ACCESS_KEY_ID="..." \
  -e AWS_SECRET_ACCESS_KEY="..." \
  -e S3_BUCKET="your-bucket" \
  litebox-api
```

## ☁️ AWS Deployment Options

### Option 1: AWS Elastic Beanstalk

1. **Install EB CLI:**

```bash
pip install awsebcli
```

2. **Initialize EB:**

```bash
eb init -p docker litebox-api --region us-east-1
```

3. **Create Environment:**

```bash
eb create litebox-api-prod
```

4. **Set Environment Variables:**

```bash
eb setenv \
  NODE_ENV=production \
  DATABASE_URL="postgresql://..." \
  AWS_REGION=us-east-1 \
  S3_BUCKET=your-bucket \
  CORS_ORIGIN=https://your-frontend.com
```

5. **Deploy:**

```bash
eb deploy
```

### Option 2: AWS ECS Fargate

1. **Push Image to ECR:**

```bash
# Create ECR repository
aws ecr create-repository --repository-name litebox-api --region us-east-1

# Get login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag litebox-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/litebox-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/litebox-api:latest
```

2. **Create ECS Task Definition** with:
   - Container: Your ECR image
   - Environment variables (DATABASE_URL, AWS_REGION, S3_BUCKET, etc.)
   - IAM Task Role with S3 permissions
   - Port mapping: 3001

3. **Create ECS Service** with:
   - Fargate launch type
   - Application Load Balancer
   - Auto-scaling (optional)

### Option 3: AWS Lambda + API Gateway (Serverless)

For serverless deployment, you can adapt this application using:

- [@vendia/serverless-express](https://github.com/vendia/serverless-express)
- AWS CDK or Serverless Framework

## 🔧 Scripts

```bash
# Development
npm run start:dev          # Run in watch mode
npm run start:debug        # Run in debug mode

# Build
npm run build              # Build for production

# Production
npm run start:prod         # Run production build

# Linting & Formatting
npm run lint               # Run ESLint
npm run format             # Format with Prettier

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report

# Prisma
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations (dev)
npm run prisma:migrate:prod # Deploy migrations (prod)
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database
```

## 📊 Database Schema

```prisma
model RelatedPost {
  id        Int      @id @default(autoincrement())
  title     String
  imageUrl  String   @map("image_url")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("related_posts")
}
```

#
