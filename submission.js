const username = localStorage.getItem("username") || "Student";

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

function openSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.add("open");
        sidebarOverlay.classList.add("show");
    }
}

function closeSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("show");
    }
}

if (menuButton) {
    menuButton.addEventListener("click", () => {
        const isOpen = sidebar.classList.contains("open");

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
}

const searchInput = document.getElementById("submissionSearch");
const statusFilter = document.getElementById("submissionStatus");
const subjectFilter = document.getElementById("submissionSubject");
const tableRows = document.querySelectorAll("#submissionTableBody tr");
const emptyState = document.getElementById("emptyState");
const submissionCount = document.getElementById("submissionCount");

function filterSubmissions() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;
    const selectedSubject = subjectFilter.value;

    let visibleRows = 0;

    tableRows.forEach(row => {
        const assignment = row.textContent.toLowerCase();
        const rowStatus = row.dataset.status;
        const rowSubject = row.dataset.subject;

        const matchesSearch = assignment.includes(searchValue);
        const matchesStatus =
            selectedStatus === "all" || rowStatus === selectedStatus;
        const matchesSubject =
            selectedSubject === "all" || rowSubject === selectedSubject;

        if (matchesSearch && matchesStatus && matchesSubject) {
            row.style.display = "";
            visibleRows++;
        } else {
            row.style.display = "none";
        }
    });

    submissionCount.textContent =
        `${visibleRows} submission${visibleRows !== 1 ? "s" : ""}`;

    emptyState.style.display = visibleRows === 0 ? "block" : "none";
}

if (searchInput) {
    searchInput.addEventListener("input", filterSubmissions);
}

if (statusFilter) {
    statusFilter.addEventListener("change", filterSubmissions);
}

if (subjectFilter) {
    subjectFilter.addEventListener("change", filterSubmissions);
}

const submissionModal = document.getElementById("submissionModal");
const openSubmissionModal = document.getElementById("openSubmissionModal");
const closeSubmissionModal = document.getElementById("closeSubmissionModal");
const cancelSubmission = document.getElementById("cancelSubmission");
const submissionForm = document.getElementById("submissionForm");
const submissionFile = document.getElementById("submissionFile");
const selectedFile = document.getElementById("selectedFile");

function showSubmissionModal() {
    submissionModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function hideSubmissionModal() {
    submissionModal.classList.remove("show");
    document.body.style.overflow = "";
}

if (openSubmissionModal) {
    openSubmissionModal.addEventListener("click", showSubmissionModal);
}

if (closeSubmissionModal) {
    closeSubmissionModal.addEventListener("click", hideSubmissionModal);
}

if (cancelSubmission) {
    cancelSubmission.addEventListener("click", hideSubmissionModal);
}

if (submissionFile) {
    submissionFile.addEventListener("change", () => {
        if (submissionFile.files.length > 0) {
            selectedFile.textContent = submissionFile.files[0].name;
        } else {
            selectedFile.textContent = "No file selected";
        }
    });
}

if (submissionForm) {
    submissionForm.addEventListener("submit", event => {
        event.preventDefault();

        const assignmentName = document.getElementById("assignmentName").value;

        if (!assignmentName || !submissionFile.files.length) {
            alert("Please select an assignment and upload a file.");
            return;
        }

        alert(
            "Submission saved as a demo. Flask backend will be connected later."
        );

        submissionForm.reset();
        selectedFile.textContent = "No file selected";
        hideSubmissionModal();
    });
}

const detailsModal = document.getElementById("detailsModal");
const closeDetailsModal = document.getElementById("closeDetailsModal");
const detailsTitle = document.getElementById("detailsTitle");
const detailsStatus = document.getElementById("detailsStatus");
const detailsDescription = document.getElementById("detailsDescription");
const viewButtons = document.querySelectorAll(".view-button");

viewButtons.forEach(button => {
    button.addEventListener("click", () => {
        const submissionName = button.dataset.submission;
        const row = button.closest("tr");
        const status = row.querySelector(".status-badge").textContent;

        detailsTitle.textContent = submissionName;
        detailsStatus.textContent = status;
        detailsDescription.textContent =
            "This is a demo submission record. Detailed submission information will be connected to the Flask backend later.";

        detailsModal.classList.add("show");
        document.body.style.overflow = "hidden";
    });
});

if (closeDetailsModal) {
    closeDetailsModal.addEventListener("click", () => {
        detailsModal.classList.remove("show");
        document.body.style.overflow = "";
    });
}

document.addEventListener("click", event => {
    if (event.target === submissionModal) {
        hideSubmissionModal();
    }

    if (event.target === detailsModal) {
        detailsModal.classList.remove("show");
        document.body.style.overflow = "";
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        hideSubmissionModal();

        if (detailsModal) {
            detailsModal.classList.remove("show");
        }

        document.body.style.overflow = "";
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeSidebar();
    }
});