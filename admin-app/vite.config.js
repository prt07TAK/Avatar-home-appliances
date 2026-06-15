import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 3001,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        adminLogin: resolve(__dirname, 'index.html'),
        adminDashboard: resolve(__dirname, 'dashboard.html'),
        adminProducts: resolve(__dirname, 'products.html'),
        adminOrders: resolve(__dirname, 'orders.html'),
        adminServices: resolve(__dirname, 'services.html'),
        adminCustomers: resolve(__dirname, 'customers.html'),
      }
    }
  }
})
