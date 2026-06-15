import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        product: resolve(__dirname, 'product.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        orderTracking: resolve(__dirname, 'order-tracking.html'),
        repair: resolve(__dirname, 'repair.html'),
        contact: resolve(__dirname, 'contact.html'),
        auth: resolve(__dirname, 'auth.html')
      }
    }
  }
})
