FROM node:20-alpine3.21

WORKDIR /app

# Salin package.json dan package-lock.json terlebih dahulu untuk efisiensi layer caching
COPY package*.json ./

# Install dependensi frontend
RUN npm install

# Salin seluruh kode sumber frontend
COPY . .

# Bangun aplikasi Next.js ke mode produksi saat pembuatan image
RUN npm run build

# Ekspos port default Next.js
EXPOSE 3000

# Jalankan Next.js server produksi saat container berjalan
CMD ["npm", "start"]