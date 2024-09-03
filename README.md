# Realtime Interactive Whiteboard

This project is a real-time collaborative whiteboard application built using React, TypeScript, and Socket.IO. The application allows multiple users to draw shapes, scribbles, and annotations on a shared canvas in real-time. It also integrates a machine learning model using the Hugging Face Inference API, allowing users to convert handwritten text on the whiteboard into digital text.

## Demo Video

https://github.com/user-attachments/assets/7d46a193-8047-484a-ac31-11e45349d640

## Features

- **KeyCloak:** Integrated Keycloak for authentication and created public and protected routes on backend using middleware
- **Real-Time Collaboration:** Multiple users can draw on the whiteboard simultaneously, with changes instantly reflected for all participants.
- **Drawing Tools:** Users can select from various drawing tools, including rectangles, circles, arrows, and freehand scribbles.
- **Undo/Redo Functionality:** The whiteboard supports undo and redo actions to manage drawing history.
- **Color Customization:** Users can customize the stroke and fill colors for shapes.
- **Canvas Export:** The entire canvas can be exported as a PNG image.
- **Handwritten Text Recognition:** Convert handwritten text on the whiteboard into digital text using the `microsoft/trocr-base-handwritten` model from Hugging Face.

## Setup Project

### 1. Setup Keycloak using Docker

You can set up Keycloak using Docker to manage authentication for your real-time collaborative whiteboard. Follow these steps:

```bash
# Pull Keycloak Docker Image
docker pull quay.io/keycloak/keycloak:latest

# Run Keycloak
docker run -d --name keycloak \
  -p 4000:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

### 2. Clone the Project
```bash
git clone https://github.com/your-username/interactive-whiteboard-ml.git
cd interactive-whiteboard-ml
```
Install Backend Dependencies:
```bash
cd backend
npm install
```
Install Frontend Dependencies:
```bash
cd ../frontend
npm install
```

### 3. Add .env Files
backend .env
```bash
PORT=8000
KEYCLOAK_PUBLIC_KEY=
KEYCLOAK_URL=
KEYCLOAK_REALM=
KEYCLOAK_CLIENT=
CORS_ORIGIN=
```
frontend .env
```bash
VITE_KEYCLOAK_URL=
VITE_KEYCLOAK_REALM=
VITE_KEYCLOAK_CLIENT=

VITE_BACKEND_URL=
VITE_HF_ACCESS_TOKEN=
```

