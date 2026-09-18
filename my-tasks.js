
const userRole = localStorage.getItem("role");

const addTaskButton = document.getElementById("addTaskButton");
const raiseQuestionButton = document.getElementById("raiseQuestionButton");

if (userRole === "teacher") {
    raiseQuestionButton.style.display = "none";
} else {
    addTaskButton.style.display = "none";
}

addTaskButton.addEventListener("click", () => {
    alert("Add Task form will open here.");
});

raiseQuestionButton.addEventListener("click", () => {
    const question = prompt("Enter your question:");

    if (question && question.trim() !== "") {
        alert("Your question has been submitted.");
    }
});const username = localStorage.getItem("username") || "Student";

const sidebarUsername = document.getElementById("sidebarUsername");
const topbarUsername = document.getElementById("topbarUsername");

if (sidebarUsername) {
    sidebarUsername.textContent = username;
}

if (topbarUsername) {
    topbarUsername.textContent = username;
}

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

if (menuButton && sidebar && sidebarOverlay) {
    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("show");
    });

    sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("show");
    });
}

const taskSearch = document.getElementById("taskSearch");
const statusFilter = document.getElementById("statusFilter");
const subjectFilter = document.getElementById("subjectFilter");
const taskItems = document.querySelectorAll(".task-item");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");

function filterTasks() {
    const searchValue = taskSearch.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;
    const selectedSubject = subjectFilter.value;

    let visibleTasks = 0;

    taskItems.forEach(task => {
        const title = task.dataset.title.toLowerCase();
        const subject = task.dataset.subject;
        const status = task.dataset.status;

        const matchesSearch = title.includes(searchValue);
        const matchesStatus = selectedStatus === "all" || status === selectedStatus;
        const matchesSubject = selectedSubject === "all" || subject === selectedSubject;

        if (matchesSearch && matchesStatus && matchesSubject) {
            task.style.display = "flex";
            visibleTasks++;
        } else {
            task.style.display = "none";
        }
    });

    taskCount.textContent = visibleTasks;
    emptyState.style.display = visibleTasks === 0 ? "block" : "none";
}

taskSearch.addEventListener("input", filterTasks);
statusFilter.addEventListener("change", filterTasks);
subjectFilter.addEventListener("change", filterTasks);

const taskModal = document.getElementById("taskModal");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");
const modalTaskTitle = document.getElementById("modalTaskTitle");
const modalTaskDescription = document.getElementById("modalTaskDescription");
const modalTaskDue = document.getElementById("modalTaskDue");
const modalSubmit = document.getElementById("modalSubmit");

const viewTaskButtons = document.querySelectorAll(".view-task");

viewTaskButtons.forEach(button => {
    button.addEventListener("click", () => {
        modalTaskTitle.textContent = button.dataset.title;
        modalTaskDescription.textContent = button.dataset.description;
        modalTaskDue.textContent = button.dataset.due;

        taskModal.classList.add("show");
    });
});

function closeModal() {
    taskModal.classList.remove("show");
}

modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);

taskModal.addEventListener("click", event => {
    if (event.target === taskModal) {
        closeModal();
    }
});

modalSubmit.addEventListener("click", () => {
    alert("Assignment submission will be available soon.");
});

window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModal();
    }
});