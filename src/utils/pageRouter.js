import { connectWallet } from "./wallet.js";
import { initTokenModal } from "./tokenModal.js";
import { provider } from "./wallet.js";
import { debug } from "./debugUtils.js";
import { appVersion } from "../config/constants.js";

let currentPage = null;


// Init page
export async function initPage(page) {
  const versionElement = document.getElementById("appVersion");

  if (versionElement) {
    versionElement.textContent = `${appVersion}`;
}

  currentPage = page;
  
  if (page === "swap") {
    const module = await import("../swap/swapCore.js");
    module.initSwap();
    initTokenModal();
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