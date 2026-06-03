FROM node:20-alpine3.21

WORKDIR /app

# Salin package.json dan package-lock.json terlebih dahulu untuk efisiensi layer caching
COPY package*.json ./

# Install dependensi (termasuk devDependencies untuk kompilasi TypeScript)
RUN npm install

# Salin folder prisma dan generate client Prisma sebelum salin sisa kode
COPY prisma ./prisma/
RUN npx prisma generate

# Salin seluruh kode sumber backend
COPY . .

# Kompilasi TypeScript ke JavaScript (dist/)
RUN npm run build

# Ekspos port default backend Express
EXPOSE 5000

# Jalankan backend Express saat container berjalan
CMD ["npm", "start"]
