console.log("LinkedIn content script running...");

const scrollAndExtractThreads = async () => {
  console.log("scrollAndExtractThreads called")
  const container = document.querySelector('.msg-conversations-container__conversations-list');
  let previousHeight = 0;
  let stableCount = 0;

  while (stableCount < 3) {
    container.scrollTo(0, container.scrollHeight);
    await new Promise(r => setTimeout(r, 1000)); // wait for lazy load

    const currentHeight = container.scrollHeight;
    if (currentHeight === previousHeight) {
      stableCount++;
    } else {
      stableCount = 0;
      previousHeight = currentHeight;
    }
  }

  // Now extract as usual
  return getMessages();
};

const scrollAndExtractConnections = async () => {
  console.log("scrollAndExtractConnections called")
  const container = document.querySelector('main#workspace');
  let previousHeight = 0;
  let stableCount = 0;

  while (stableCount < 3) {
    console.log("Scrolling to:", container.scrollHeight);
    container.scrollTo(0, container.scrollHeight);
    await new Promise(r => setTimeout(r, 1000)); // wait for lazy load

    const currentHeight = container.scrollHeight;
    if (currentHeight === previousHeight) {
      stableCount++;
    } else {
      stableCount = 0;
      previousHeight = currentHeight;
    }
  }

  // Now extract as usual
  return getConnections();
};


const getMessages = () => {
  console.log("getMessages Called")
  const threads = document.querySelectorAll('.msg-conversation-card__rows');
  const results = [];

  threads.forEach(thread => {
    const name = thread.querySelector('.msg-conversation-card__participant-names')?.innerText;
    const snippet = thread.querySelector('.msg-conversation-card__message-snippet')?.innerText;
    const time = thread.querySelector('.msg-conversation-card__time-stamp')?.innerText;
    console.log(time)

    results.push({
      name: name?.trim(),
      lastMessage: snippet?.trim(),
      lastInteraction: time?.trim()
    });
  });

  return results;
};

const getConnections = () => {
  console.log("getConnections Called")
  const threads = document.querySelectorAll('._1k2lxme120._1xoe5hdi.cnuthtb4.cnutht15c.cnutht14.cnuthte0.cnuthtg8');
  const results = [];

  threads.forEach(thread => {
    const name = thread.querySelector('._139m7k1io._3g29zz0')?.innerText;
    const link = thread.querySelector('._139m7k1io._3g29zz0')?.href;
    const title = thread.querySelector('._1s9oaxgp._29kmc36._1lu65cq3._1lu65cq1._1xoe5hd4a._1s9oaxgo._1ptbkx68w._1s9oaxg0')?.innerText;
    const date = thread.querySelector('._1s9oaxgp._29kmc36._1s9oaxg0._1s9oaxg4._1s9oaxg5._1s9oaxg7._1s9oaxgc._139m7k1hi._1s9oaxgn')?.innerText;
  

    results.push({
      name: name?.trim(),
      liUrl: link?.trim(),
      title: title?.trim(),
      connDate: date?.trim()
    });
  });

  return results;
};

const getProfileData = () => {
  console.log("Profile scraper content script running...");

  const name = document.querySelector('h1')?.innerText.trim();
  const title = document.querySelector('.text-body-medium.break-words')?.innerText.trim();
  const company = document.querySelector('[data-view-name="profile-card"] a[href*="/company/"]')?.innerText.trim();

  if (name && (title || company)) {
    chrome.runtime.sendMessage({
      type: "profileData",
      name,
      title,
      company
    });
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "extractAllMessages") {
    (async () => {
      const newData = await scrollAndExtractThreads();
      console.log("Extracted messages:", newData);

      chrome.storage.local.get(['contacts'], (result) => {
        const existingContacts = result.contacts || [];

        const updatedContacts = [...existingContacts];

        newData.forEach(newContact => {
          const existingIndex = updatedContacts.findIndex(c => c.name === newContact.name);

          if (existingIndex !== -1) {
            // 🔄 Update existing contact
            updatedContacts[existingIndex] = {
              ...updatedContacts[existingIndex],
              ...newContact
            };
          } else {
            // ➕ Add new contact
            updatedContacts.push(newContact);
          }
        });

        chrome.storage.local.set({ contacts: updatedContacts, lastMessageFetch: Date.now() }, () => {
          console.log("Contacts merged and saved to Chrome storage!");
          sendResponse({ data: updatedContacts });
        });
      });
    })();

    return true; // Keeps sendResponse alive for async work
  }

  if (msg.type === "extractAllConnections") {
    (async () => {
      const data = await scrollAndExtractConnections();

      console.log("Extracted Connections:", data);

      chrome.storage.local.set({ contacts: data, lastConnectionFetch: Date.now() }, () => {
        console.log("Contacts saved to Chrome storage!");
        sendResponse({ data });
      });
    })();

    return true;
  }

  if (msg.type === "extractSmartMessages") {
    const data = getMessages();

    // 🔥 Save to chrome.storage.local
    chrome.storage.local.get('contacts', (result) => {
      const existing = result.contacts || [];

      // Optional: prevent duplicates (you can improve matching later)
      const merged = [...existing];
      for (const contact of data) {
        const alreadyExists = existing.some(c => c.name === contact.name && c.lastMessage === contact.lastMessage);
        if (!alreadyExists) merged.push(contact);
      }

      console.log("Extracted messages:", data);

      chrome.storage.local.set({ contacts: merged, lastMessageFetch: Date.now() }, () => {
        console.log("Contacts saved to Chrome storage!");
        sendResponse({ data: merged });
      });
    });

    // Required: return true to keep sendResponse open asynchronously
    return true;
  }

  if (msg.type === "extractSmartConnections") {
    const data = getConnections();

    // 🔥 Save to chrome.storage.local
    chrome.storage.local.get('contacts', (result) => {
      const existing = result.contacts || [];

      // Optional: prevent duplicates (you can improve matching later)
      const merged = [...existing];
      for (const contact of data) {
        const alreadyExists = existing.some(c => c.name === contact.name && c.lastMessage === contact.lastMessage);
        if (!alreadyExists) merged.push(contact);
      }

      console.log("Extracted messages:", data);

      chrome.storage.local.set({ contacts: merged, lastConnectionFetch: Date.now() }, () => {
        console.log("Contacts saved to Chrome storage!");
        sendResponse({ data: merged });
      });
    });

    // Required: return true to keep sendResponse open asynchronously
    return true;
  }

  if (msg.type === "extractProfiles") {
    chrome.storage.local.get(['contacts'], async (result) => {
      const contacts = result.contacts || [];
      const updatedContacts = [...contacts];

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];

        if (!contact.title || !contact.company) {
          console.log(`Opening ${contact.name}'s profile: ${contact.liUrl}`);

          // Open new tab with delay
          await new Promise(resolve => {
            chrome.tabs.create({ url: contact.liUrl, active: false }, (tab) => {
              const listener = (updatedTabId, changeInfo) => {
                if (updatedTabId === tab.id && changeInfo.status === 'complete') {
                  chrome.tabs.sendMessage(tab.id, { type: "extractProfileData" }, (response) => {
                    if (response) {
                      updatedContacts[i] = {
                        ...contact,
                        ...response // assumed to be { title: "...", company: "..." }
                      };
                      chrome.storage.local.set({ contacts: updatedContacts });
                    }
                    // Close the tab after extraction
                    chrome.tabs.remove(tab.id);
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                  });
                }
              };
              chrome.tabs.onUpdated.addListener(listener);
            });
          });

          // Add delay between tabs
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      console.log("All missing profiles updated.");
    });

    return true;
  }

});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "extractProfileData") {
    const title = document.querySelector('.visually-hidden')?.innerText;

    const company = document.querySelector('[aria-hidden="true"]')?.innerText
                    document.querySelector('.pv-text-details__right-panel .text-body-small')?.innerText;

    console.log(title);
    console.log(company);
    
    sendResponse({
      title: title?.trim(),
      company: company?.trim()
    });

    return true;
  }
});


// chrome.storage.local.get('contacts', (result) => {
//   const contacts = result.contacts || [];

//   fetch("http://localhost:3000/api/save-contacts", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ contacts })
//   })
//     .then(res => res.json())
//     .then(data => {
//       console.log("Contacts sent to app successfully!", data);
//     })
//     .catch(err => console.error("Error syncing to app:", err));
// });



