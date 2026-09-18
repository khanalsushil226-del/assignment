const username = localStorage.getItem("username") || "Student";

const sidebarUsername = document.getElementById("sidebarUsername");
const topbarUsername = document.getElementById("topbarUsername");
const sidebarAvatar = document.getElementById("sidebarAvatar");

if (sidebarUsername) {
    sidebarUsername.textContent = username;
}

if (topbarUsername) {
    topbarUsername.textContent = username;
}

if (sidebarAvatar) {
    sidebarAvatar.textContent = username.charAt(0).toUpperCase();
}

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

const calendarMonth = document.getElementById("calendarMonth");
const calendarDays = document.getElementById("calendarDays");
const previousMonth = document.getElementById("previousMonth");
const nextMonth = document.getElementById("nextMonth");
const todayButton = document.getElementById("todayButton");
const upcomingList = document.getElementById("upcomingList");
const upcomingCount = document.getElementById("upcomingCount");
const emptyUpcoming = document.getElementById("emptyUpcoming");

let currentDate = new Date();

const assignments = [
    {
        title: "Build a Calculator",
        subject: "Python",
        date: "2026-09-22"
    },
    {
        title: "Database Assignment",
        subject: "Database",
        date: "2026-09-25"
    },
    {
        title: "Responsive Website",
        subject: "Web Development",
        date: "2026-09-29"
    },
    {
        title: "Python Practice",
        subject: "Python",
        date: "2026-10-04"
    },
    {
        title: "Final Project",
        subject: "Project",
        date: "2026-10-10"
    }
];

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function getDateKey(year, month, day) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");

    return `${year}-${formattedMonth}-${formattedDay}`;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    calendarMonth.textContent = monthName;
    calendarDays.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const today = new Date();

    const todayKey = getDateKey(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "calendar-day empty";
        calendarDays.appendChild(emptyDay);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateKey = getDateKey(year, month, day);

        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day";

        if (dateKey === todayKey) {
            dayElement.classList.add("today");
        }

        const dayNumber = document.createElement("div");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;

        dayElement.appendChild(dayNumber);

        const dayAssignments = assignments.filter(
            assignment => assignment.date === dateKey
        );

        if (dayAssignments.length > 0) {
            dayElement.classList.add("has-assignment");

            dayAssignments.forEach(assignment => {
                const eventElement = document.createElement("div");
                eventElement.className = "assignment-event";
                eventElement.textContent = assignment.title;
                eventElement.title = assignment.title;

                dayElement.appendChild(eventElement);
            });
        }

        calendarDays.appendChild(dayElement);
    }

    renderUpcomingAssignments();
}

function renderUpcomingAssignments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAssignments = assignments
        .filter(assignment => {
            const assignmentDate = new Date(`${assignment.date}T00:00:00`);
            return assignmentDate >= today;
        })
        .sort((first, second) => {
            return first.date.localeCompare(second.date);
        });

    upcomingList.innerHTML = "";
    upcomingCount.textContent = upcomingAssignments.length;

    if (upcomingAssignments.length === 0) {
        emptyUpcoming.style.display = "block";
        return;
    }

    emptyUpcoming.style.display = "none";

    upcomingAssignments.forEach(assignment => {
        const item = document.createElement("div");
        item.className = "upcoming-item";

        const title = document.createElement("h3");
        title.textContent = assignment.title;

        const subject = document.createElement("span");
        subject.className = "upcoming-subject";
        subject.textContent = assignment.subject;

        const date = document.createElement("div");
        date.className = "upcoming-date";

        date.innerHTML = `
            <span>▣</span>
            <strong>${formatDate(assignment.date)}</strong>
        `;

        item.appendChild(title);
        item.appendChild(subject);
        item.appendChild(date);

        upcomingList.appendChild(item);
    });
}

previousMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

todayButton.addEventListener("click", () => {
    currentDate = new Date();
    renderCalendar();
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeSidebar();
    }
});

renderCalendar();