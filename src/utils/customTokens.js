import { defaultTokens } from "../config/tokens.js";

let tokens = [...defaultTokens];

//  LOAD tokens from local browser storage
export function loadTokensFromStorage() {
  const stored = localStorage.getItem("customTokens");
  if (!stored) return;

  const parsed = JSON.parse(stored);

  parsed.forEach(newToken => {
    const exists = tokens.some(
      t => t.address.toLowerCase() === newToken.address.toLowerCase()
    );

    if (!exists) tokens.push(newToken);
  });
}

// get Tokens
export function getTokens() {
  return tokens;
}

// Add tokens to local browser storage
export function addToken(token) {
  const exists = tokens.some(
    t => t.address.toLowerCase() === token.address.toLowerCase()
  );

  if (exists) return;

  tokens.push(token);
  saveTokens();
}

// SAVE only custom tokens as string in local browser storage
function saveTokens() {
  const customTokens = tokens.filter(
    t => !defaultTokens.some(d => d.address.toLowerCase() === t.address.toLowerCase())
  );

  localStorage.setItem("customTokens", JSON.stringify(customTokens));
}