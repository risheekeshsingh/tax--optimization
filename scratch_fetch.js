const fs = require('fs');

async function downloadHtml() {
  const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzNjZTIxOGNiMmZhYjQ2ZGJhZGMxYTY4OGY5ZDBjMmY2EgsSBxCJ9-uKkw0YAZIBIwoKcHJvamVjdF9pZBIVQhMyNzYzOTU4MDEwNzI0MjUxODMz&filename=&opi=89354086";
  try {
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync('C:/Users/aayus/OneDrive/Desktop/TAX FILLING AI/test_landing.html', text);
    console.log("Downloaded successfully: ", text.length, "bytes");
    console.log("First 500 chars:", text.substring(0, 500));
  } catch (err) {
    console.error("Fetch failed", err);
  }
}

downloadHtml();
