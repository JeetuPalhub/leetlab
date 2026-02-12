# LeetLab Setup Script
# This script installs dependencies and prepares the project for development.

function Write-Header($msg) {
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

Write-Header "Installing Backend Dependencies"
cd backend
npm install

Write-Header "Generating Prisma Client"
npx prisma generate

Write-Header "Installing Frontend Dependencies"
cd ../frontend
npm install

Write-Header "Setup Complete!"
Write-Host "You can now start the backend with 'cd backend; npm run dev'"
Write-Host "And the frontend with 'cd frontend; npm run dev'"
