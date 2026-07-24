import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path"; // Import Node.js path module

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],                                                                                                                                                             
  server: {                                                                                                                                                                        
    watch: {                                                                                                                                                                       
      // Ignore les fichiers et dossiers commençant par .aider                                                                                                                     
      ignored: ['**/.aider*/**'],                                                                                                                                                  
    },                                                                                                                                                                             
    // ... autres configurations du serveur (host, port, etc.)                                                                                                                     
    host: true, // Vous avez --host dans votre script npm                                                                                                                          
    port: 3000, // Vous avez --port 3000 dans votre script npm                                                                                                                     
    allowedHosts: ['hypnocaments.test', 'chris-desktop'],
  }, 
  resolve: {
    alias: {
      // Define your alias here
      // Maps '@' to the 'app' directory
      '@': path.resolve(__dirname, './app'),
      // You could add others too:
      // '@/components': path.resolve(__dirname, './app/components'),
      // '@/utils': path.resolve(__dirname, './app/utils'),
    },
  },
});
