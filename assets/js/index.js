import { initializeApplication } from "./services/app-controller.js";

/**
 * @async
 * @function bootstrap
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function bootstrap() {
	try {
		await initializeApplication();
	} catch (error) {
		console.error("Application failed to initialize:", error);
		throw error;
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", bootstrap);
} else {
	bootstrap();
}
