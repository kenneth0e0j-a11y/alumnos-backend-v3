# 1. Usa la imagen "completa" de Node.js 18
FROM node:18

# 2. Instala SOLO las dependencias de sistema (CON EL NOMBRE CORREGIDO)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libpango-1.0-0 \ # <-- AQUÍ ESTÁ EL CAMBIO
    libcairo2 \
    libasound2 \
  && rm -rf /var/lib/apt/lists/*

# 3. Puppeteer ahora usará el navegador que se instala con 'npm install'
# Así que NO necesitamos la variable 'PUPPETEER_EXECUTABLE_PATH'

# 4. Prepara la app
WORKDIR /app
COPY package*.json ./
# Esta instalación AHORA SÍ descargará el navegador de puppeteer
RUN npm install

COPY . .

# 5. Expone el puerto y corre el servidor
EXPOSE 10000
CMD ["node", "src/server.js"]