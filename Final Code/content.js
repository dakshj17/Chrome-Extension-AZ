const bookmarkImgURL = chrome.runtime.getURL("assets/bookmark.png");
const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

// Observe DOM changes to detect SPA navigation
const observer = new MutationObserver(() => {
    addBookmarkButton();
});
observer.observe(document.body, { childList: true, subtree: true });

// Try adding the button immediately on load
addBookmarkButton();

function onProblemsPage() {
    return window.location.pathname.startsWith('/problems/');
}

function addBookmarkButton() {
    console.log("Attempting to add bookmark button...");

    if (!onProblemsPage() || document.getElementById("add-bookmark-button")) return;

    const askDoubtButton = document.querySelector(".coding_problem_info_difficulty__NrZ8u.d-flex.flex-wrap.justify-content-between.align-items-center.py-3.gap-3");
    if (!askDoubtButton || !askDoubtButton.parentNode) return;

    const bookmarkButton = document.createElement("img");
    bookmarkButton.id = "add-bookmark-button";
    bookmarkButton.src = bookmarkImgURL;
    bookmarkButton.style.height = "30px";
    bookmarkButton.style.width = "30px";
    bookmarkButton.style.cursor = "pointer";
    bookmarkButton.style.marginLeft = "10px";

    askDoubtButton.parentNode.insertAdjacentElement("afterend", bookmarkButton);
    bookmarkButton.addEventListener("click", addNewBookmarkHandler);
}

async function addNewBookmarkHandler() {
    const azProblemUrl = window.location.href;
    const uniqueId = extractUniqueId(azProblemUrl);
    const problemNameElement = document.querySelector(".Header_resource_heading__cpRp1");
    if (!problemNameElement) return;

    const problemName = problemNameElement.innerText;
    const currentBookmarks = await getCurrentBookmarks();

    if (currentBookmarks.some((b) => b.id === uniqueId)) return;

    const bookmarkObj = { id: uniqueId, name: problemName, url: azProblemUrl };
    const updatedBookmarks = [...currentBookmarks, bookmarkObj];

    chrome.storage.sync.set({ [AZ_PROBLEM_KEY]: updatedBookmarks }, () => {
        console.log("Bookmarks updated:", updatedBookmarks);
    });
}

function extractUniqueId(url) {
    const start = url.indexOf("problems/") + "problems/".length;
    const end = url.indexOf("?", start);
    return end === -1 ? url.substring(start) : url.substring(start, end);
}

function getCurrentBookmarks() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([AZ_PROBLEM_KEY], (result) => {
            resolve(result[AZ_PROBLEM_KEY] || []);
        });
    });
}
a