/** Latest changes:
 * centralized token modal by adding loadTokenModal in swap initPage - swap
 * added pools page initialization and version loading of pools page
 * removed unused imports
 * added updateActiveNav
 */ 

import { connectWallet } from "./wallet.js";
import { initTokenModal, loadTokenModal } from "./tokenModal.js";
import { debug } from "./debugUtils.js";
import { appVersion } from "../config/constants.js";

let currentPage = null;


// Init page
export async function initPage(page) {
    updateActiveNav(page);
    const versionElement = document.getElementById("appVersion");

    if (versionElement) {
        versionElement.textContent = `${appVersion}`;
    }

    currentPage = page;

    if (page === "swap") {
        await loadTokenModal();
        initTokenModal();
        const module = await import("../swap/swapCore.js");
        module.initSwap();
    }

    if (page === "pools") {
        await loadTokenModal();
        initTokenModal();
        initPoolVersionSwitch();
        await loadPoolsVersion("v2");
    }

    if (page === "main") {
        // static page
    }
}


// Load pace specific content in single page application
function loadPage(page) {

  fetch(page + ".html")
    .then(res => res.text())
    .then(data => {

      document.getElementById("content").innerHTML = data;

      initPage(page);
    })
    .catch(() => {

      document.getElementById("content").innerHTML =
        "<h1>Page not found</h1>";
    });
}


// Reroute to main, if no page declared; and load page content 
function loadFromHash() {

  let page = window.location.hash.replace("#/", "");

  if (!page || page === "") {
    page = "main";
  }
  
  loadPage(page);
}


// event Listener, currently unused; only there for later liquidity actions etc.
window.addEventListener("walletConnected", () => {

  switch (currentPage) {

    case "swap":
      break;
  }
});


// Wallet connect button
document.addEventListener("click", async (e) => {

  if (e.target.closest("#walletButton")) {
    await connectWallet();
  }
});


// APP initialization
document.addEventListener("DOMContentLoaded", () => {

  window.addEventListener("hashchange", loadFromHash);

  loadFromHash();
});


// Make the debug() function globally accessible
window.debug = debug;


// load pool page version
async function loadPoolsVersion(version) {
    const content = document.getElementById("poolsContent");
    if (!content) return;

    const file = version === "v3" ? "poolsV3.html" : "poolsV2.html";

    try {
        const response = await fetch(file);

        if (!response.ok) {
        throw new Error(`Error loading ${file}`);
        }

        content.innerHTML = await response.text();

        // Later V2 or V3 init
        // e.g. initPoolsV2() or initPoolsV3()
        if (version === "v2") {
            const module = await import("../pools/V2/poolsV2Core.js");
            module.initPoolsV2();
        }


    } catch (error) {
        console.error("Error loading pool page:", error);
        content.innerHTML = "<p> Not able to load pool page.</p>";
    }
}


function updateActiveNav(page) {
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.classList.remove("active");

        const href = link.getAttribute("href");
        if (!href) return;

        const linkPage = href
            .replace(/^#\/?/, "")
            .split("?")[0]
            .replace(/\.html$/, "");

        if (linkPage === page) {
            link.classList.add("active");
        }
    });
}

// init pool page version switch
function initPoolVersionSwitch() {
  const buttons = document.querySelectorAll(".version-btn.pool");

  buttons.forEach(button => {
    button.addEventListener("click", async () => {
      const version = button.dataset.version;

      // change active button
      buttons.forEach(btn => {
        btn.classList.toggle("active", btn === button);
      });

      // load page version
      await loadPoolsVersion(version);
    });
  });
}