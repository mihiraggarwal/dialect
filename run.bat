@echo off
cd ./backend/
echo Installing dependencies in backend...
npm i
echo Starting development server for backend...
npm run dev

cd ../extension/lang-ext-src/
echo Installing dependencies in lang-ext-src...
npm i
echo Building the extension...
npm run build

echo All tasks completed!