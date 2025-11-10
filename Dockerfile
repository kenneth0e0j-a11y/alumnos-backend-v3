# 1. Usamos una imagen de Node.js
FROM node:18

# 2. Instalamos las dependencias de sistema, incluyendo chromium
# (Estas son necesarias para que puppeteer-core funcione)
RUN apt-get update && apt-get install -y \
    chromium \
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
    pango \
    libcairo2 \
    libasound2 \
  && rm -rf /var/lib/apt/lists/*

# 3. Le decimos a Puppeteer dónde encontrar el navegador
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

# 4. Preparamos el directorio de la app
WORKDIR /app

# 5. Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# 6. Copiamos el resto del código
COPY . .

# 7. Exponemos el puerto que Render necesita
# (Asumiendo que tu server.js usa 'process.env.PORT')
EXPOSE 10000

# 8. Corremos el servidor
CMD ["node", "src/server.js"]