import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// react-scripts (create-react-app) was archived by the React team and its last
// release predates the Node versions this now runs on. Vite builds the same
// source tree in a fraction of the time, which matters when the image is built
// for a Raspberry Pi.
export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		// `npm run dev` proxies /api to the local backend, so the browser sees
		// one origin in development exactly as it does in production. That is
		// what lets the session cookie work without any CORS configuration.
		proxy: {
			"/api": {
				target:
					process.env.VITE_DEV_API_TARGET || "http://localhost:5000",
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: "build",
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom", "react-router-dom"],
				},
			},
		},
	},
});
