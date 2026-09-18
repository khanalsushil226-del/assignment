const username = localStorage.getItem("username") || "Student";

const sidebarUsername = document.getElementById("sidebarUsername");
const topbarUsername = document.getElementById("topbarUsername");
const sidebarAvatar = document.getElementById("sidebarAvatar");

const profileUsername = document.getElementById("profileUsername");
const profileDisplayName = document.getElementById("profileDisplayName");
const profileAvatar = document.getElementById("profileAvatar");
const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");

if (sidebarUsername) {
    sidebarUsername.textContent = username;
}

if (topbarUsername) {
    topbarUsername.textContent = username;
}

if (sidebarAvatar) {
    sidebarAvatar.textContent = username.charAt(0).toUpperCase();
}

if (profileUsername) {
    profileUsername.value = username;
}

if (profileDisplayName) {
    profileDisplayName.textContent = username;
}

if (profileAvatar) {
    profileAvatar.textContent = username.charAt(0).toUpperCase();
}

profileForm.addEventListener("submit", event => {
    event.preventDefault();

    const updatedUsername = profileUsername.value.trim();

    if (updatedUsername === "") {
        profileMessage.textContent = "Username cannot be empty.";
        return;
    }

    localStorage.setItem("username", updatedUsername);

    if (sidebarUsername) {
        sidebarUsername.textContent = updatedUsername;
    }

    if (topbarUsername) {
        topbarUsername.textContent = updatedUsername;
    }

    if (profileDisplayName) {
        profileDisplayName.textContent = updatedUsername;
    }

    if (sidebarAvatar) {
        sidebarAvatar.textContent = updatedUsername.charAt(0).toUpperCase();
    }

    if (profileAvatar) {
        profileAvatar.textContent = updatedUsername.charAt(0).toUpperCase();
    }

    profileMessage.textContent = "Profile updated successfully.";
});

const assignmentReminders = document.getElementById("assignmentReminders");
const submissionUpdates = document.getElementById("submissionUpdates");
const compactView = document.getElementById("compactView");

assignmentReminders.checked =
    localStorage.getItem("assignmentReminders") !== "false";

submissionUpdates.checked =
    localStorage.getItem("submissionUpdates") !== "false";

compactView.checked =
    localStorage.getItem("compactView") === "true";

assignmentReminders.addEventListener("change", () => {
    localStorage.setItem(
        "assignmentReminders",
        assignmentReminders.checked
    );
});

submissionUpdates.addEventListener("change", () => {
    localStorage.setItem(
        "submissionUpdates",
        submissionUpdates.checked
    );
});

compactView.addEventListener("change", () => {
    localStorage.setItem("compactView", compactView.checked);

    document.body.classList.toggle(
        "compact-mode",
        compactView.checked
    );
});

if (compactView.checked) {
    document.body.classList.add("compact-mode");
}

const changePassword = document.getElementById("changePassword");
const securityMessage = document.getElementById("securityMessage");

changePassword.addEventListener("click", () => {
    securityMessage.textContent =
        "Password management will be available after backend integration.";
});

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
}

if (menuButton && sidebar && sidebarOverlay) {
    menuButton.addEventListener("click", () => {
        const isOpen = sidebar.classList.contains("open");

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    sidebarOverlay.addEventListener("click", closeSidebar);
}

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
            closeSidebar();
        }
    });
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeSidebar();
    }
});