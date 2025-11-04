// ✅ Helper Functions
function getUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}
function goTo(page) {
    window.location.href = page;
}
function logout() {
    alert("Logged out ✅");
    window.location.assign("index.html");
}
function toggleMode() {
    document.body.classList.toggle("dark-mode");
}
function timeAgo(t) {
    const s = Math.floor((Date.now() - t) / 1000);
    if (s < 60) return "Just now";
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
    return `${Math.floor(s / 86400)} days ago`;
}
function storeKey(ns, email) {
    return `${ns}:${email}`;
}

// ✅ Page Detector
function on(page) {
    return window.location.pathname.endsWith(page);
}

// ✅ Signup Logic
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = signupName.value.trim();
            const email = signupEmail.value.trim();
            const password = signupPassword.value;

            if (!name || !email || !password) {
                alert("Please fill all fields");
                return;
            }

            const user = { name, email, password };
            localStorage.setItem("user", JSON.stringify(user));

            // Initialize storage for this user
            localStorage.setItem(`profile:${email}`, JSON.stringify({ headline: "", about: "" }));
            localStorage.setItem(`connections:${email}`, JSON.stringify([]));
            localStorage.setItem(`requests:${email}`, JSON.stringify([]));
            localStorage.setItem(`notifications:${email}`, JSON.stringify([]));
            localStorage.setItem(`messages:${email}`, JSON.stringify({}));

            alert("Signup Successful ✅");
            window.location.href = "index.html";
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const saved = getUser();
            if (!saved) return alert("User not found! Signup first");

            if (loginEmail.value === saved.email &&
                loginPassword.value === saved.password) {
                alert("Login Successful ✅");
                window.location.href = "feed.html";
            } else {
                alert("Invalid Credentials ❌");
            }
        });
    }

    if (on("feed.html")) initFeed();
});

// ✅ FEED PAGE
function initFeed() {
    const user = getUser();
    if (!user) return goTo("index.html");

    document.getElementById("profileName").innerText = user.name;
    document.getElementById("profileEmail").innerText = user.email;

    displayPosts();
    updateProfileCounts();
}

// ✅ Create New Post
function createPost() {
    const text = postInput.value.trim();
    const file = postImage.files[0];
    const user = getUser();

    if (!text && !file) return alert("Write something to post!");

    const reader = new FileReader();
    reader.onload = () => {
        const newPost = {
            name: user.name,
            email: user.email,
            text,
            image: file ? reader.result : null,
            time: Date.now(),
            likes: 0
        };

        const posts = JSON.parse(localStorage.getItem("posts") || "[]");
        posts.unshift(newPost);
        localStorage.setItem("posts", JSON.stringify(posts));

        postInput.value = "";
        postImage.value = "";

        displayPosts();
        updateProfileCounts();
    };
    if (file) reader.readAsDataURL(file);
    else reader.onload();
}

// ✅ Display Posts
function displayPosts() {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const area = document.getElementById("postsArea");
    if (!area) return;

    area.innerHTML = posts.map((p, i) => `
        <div class="post-card">
            <h4>${p.name}</h4>
            <p>${p.text}</p>
            ${p.image ? `<img src="${p.image}" class="post-img">` : ""}
            <small>${timeAgo(p.time)}</small>
            <div class="actions">
                <button onclick="likePost(${i})">👍 ${p.likes}</button>
                <button onclick="editPost(${i})">✏️ Edit</button>
                <button onclick="deletePost(${i})">🗑️ Delete</button>
            </div>
        </div>
    `).join("");
}

function likePost(i) {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    posts[i].likes++;
    localStorage.setItem("posts", JSON.stringify(posts));
    displayPosts();
}

function editPost(i) {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const updated = prompt("Edit your post:", posts[i].text);
    if (updated !== null) {
        posts[i].text = updated;
        localStorage.setItem("posts", JSON.stringify(posts));
        displayPosts();
    }
}

function deletePost(i) {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    posts.splice(i, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    displayPosts();
    updateProfileCounts();
}

// ✅ Profile Count Update
function updateProfileCounts() {
    const user = getUser();
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const count = posts.filter(p => p.email === user.email).length;

    document.getElementById("postCount").innerText = `${count} Posts`;
}
