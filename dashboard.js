
const username = localStorage.getItem("username") || "Student";

const sidebarUsername = document.getElementById("sidebarUsername");
const topbarUsername = document.getElementById("topbarUsername");
const welcomeUsername = document.getElementById("welcomeUsername");

if (sidebarUsername) {
    sidebarUsername.textContent = username;
}

if (topbarUsername) {
    topbarUsername.textContent = username;
}

if (welcomeUsername) {
    welcomeUsername.textContent = username;
}const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const navLinks = document.querySelectorAll(".nav-link");
const taskButtons = document.querySelectorAll(".task-button");

const taskModal = document.getElementById("taskModal");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");
const modalSubmit = document.getElementById("modalSubmit");

const modalTaskTitle = document.getElementById("modalTaskTitle");
const modalTaskDescription = document.getElementById("modalTaskDescription");

const currentDate = document.getElementById("currentDate");

const taskDescriptions = {
    "Build a Calculator": "Create a calculator using Python functions and conditional statements. Submit your completed Python file.",
    "Database Assignment": "Design a relational database and write SQL queries for the given problem. Upload your database assignment.",
    "Responsive Website": "Create a responsive website using HTML, CSS, and JavaScript. Submit your project files."
};

function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
}

menuButton.addEventListener("click", () => {
    const isOpen = sidebar.classList.contains("open");

    if (isOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
});

sidebarOverlay.addEventListener("click", closeSidebar);

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        if (window.innerWidth <= 900) {
            closeSidebar();
        }
    });
});

function openTaskModal(taskName) {
    modalTaskTitle.textContent = taskName;

    modalTaskDescription.textContent =
        taskDescriptions[taskName] ||
        "Assignment details will appear here.";

    taskModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeTaskModal() {
    taskModal.classList.remove("show");
    document.body.style.overflow = "";
}

taskButtons.forEach(button => {
    button.addEventListener("click", () => {
        const taskName = button.dataset.task;
        openTaskModal(taskName);
    });
});

modalClose.addEventListener("click", closeTaskModal);
modalCancel.addEventListener("click", closeTaskModal);

taskModal.addEventListener("click", event => {
    if (event.target === taskModal) {
        closeTaskModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeTaskModal();
    }
});

modalSubmit.addEventListener("click", () => {
    alert("Assignment submission will be connected to Flask soon.");
});

function updateDate() {
    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    currentDate.textContent = formattedDate;
}

updateDate();

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeSidebar();
    }
});