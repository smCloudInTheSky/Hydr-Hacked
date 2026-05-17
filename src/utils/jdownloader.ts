import { CONFIG } from "./config.js";
import * as fs from "fs";
import * as path from "path";

// --- JDownloader ---
export async function sendToJDownloader(
  link: string,
  titleName: string,
  isSeries: boolean = false,
) {
  // 1. Sanitize input
  const safeLink = link.replace(/[\r\n]/g, "").trim();
  let safeTitle = "";

  if (titleName) {
    safeTitle = titleName
      .replace(/[\r\n<>:"/\\|?*]+/g, "")
      .replace(/\.$/, "")
      .trim();

    if (isSeries) {
      console.log(`Série (${safeTitle}), configuration paquet JD...`);
      // WARNING: The provided API endpoint does not accept a 'downloadFolder' parameter.
      // JDownloader will rely on your default download directory + the packageName.
      console.log(` -> Note: Custom downloadFolder is not supported by this specific API route.`);
    } else {
      console.log(`Film (${safeTitle}), configuration paquet JD...`);
    }
    console.log(` -> PackageName: ${safeTitle}`);
  }

  // 2. Construct API query parameters safely
  const params = new URLSearchParams({
    links: safeLink,
    packageName: safeTitle,
    extractPassword: "", // Left empty as it wasn't in the original crawljob
    downloadPassword: "", // Left empty as it wasn't in the original crawljob
  });

  const apiUrl = `http://${CONFIG.JD_HOST}:${CONFIG.JD_API_PORT}/linkcollector/addLinksAndStartDownload?${params.toString()}`;

  // 3. Call the API
  try {
    const response = await fetch(apiUrl, {
      method: "GET", // Change to 'POST' if your specific JDownloader API configuration requires it
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // The API returns a boolean or null based on your spec
    const result = await response.json();

    if (result === true) {
      console.log(`✅ Lien (${safeTitle || "Sans titre"}) envoyé avec succès à l'API JDownloader.`);
    } else {
      console.log(`⚠️ JDownloader a reçu la requête mais a retourné: ${result}`);
    }
  } catch (error) {
    console.error(`❌ Erreur API JDownloader:`, error.message);
  }
}
