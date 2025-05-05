
document.getElementById("extract").addEventListener("click", () => {
  const action = document.getElementById("action-select").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    
      // 💥 Message the script once it's injected
      chrome.tabs.sendMessage(tabId, { type: action }, (response) => {
        console.log("Response from content script:", response);
      });
  });
});

// document.getElementById("extract-all").addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const tabId = tabs[0].id;

//     chrome.scripting.executeScript({
//       target: { tabId },
//       files: ["content.js"]
//     }, () => {
//       // 💥 Message the script once it's injected
//       chrome.tabs.sendMessage(tabId, { type: mode === "full" ? "extractAllMessages" : "extractNewMessages" }, (response) => {
//         console.log("Response from content script:", response);
//       });
//     });
//   });
// });


document.getElementById("sync").addEventListener("click", () => {
  chrome.storage.local.get('contacts', (result) => {
    const contacts = result.contacts || [];

    fetch("http://localhost:3000/api/save-contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacts })
    })
      .then(res => res.json())
      .then(data => console.log("Synced to app:", data))
      .catch(err => console.error(err));
  });
});
