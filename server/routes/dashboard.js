import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const isTeacher = req.user.role === "teacher";

  const totalAssignments = db
    .prepare("SELECT COUNT(*) AS count FROM assignments")
    .get().count;

  const data = {
    totalAssignments,
    isTeacher,
  };

  if (isTeacher) {
    const stats = db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM submissions WHERE status = 'review') AS review,
           (SELECT COUNT(*) FROM submissions WHERE status = 'approved') AS approved,
           (SELECT COUNT(*) FROM submissions WHERE status = 'revision') AS revision,
           (SELECT COUNT(*) FROM submissions) AS totalSubmissions`
      )
      .get();

    data.pendingApprovals = stats.review;
    data.totalSubmissions = stats.totalSubmissions;
    data.review = stats.review;
    data.approved = stats.approved;
    data.revision = stats.revision;
    data.completionRate = 0;

    if (stats.totalSubmissions > 0) {
      data.completionRate = Math.round(
        (stats.approved / stats.totalSubmissions) * 100
      );
    }

    data.stats = [
      { label: "Assignments Posted", value: totalAssignments },
      { label: "Total Submissions", value: stats.totalSubmissions },
      { label: "Under Review", value: stats.review },
      { label: "Approved", value: stats.approved },
    ];
  } else {
    const submissions = db
      .prepare("SELECT * FROM submissions WHERE student_id = ?")
      .all(req.user.id);

    const submitted = submissions.length;
    const pending = Math.max(0, totalAssignments - submitted);
    const completionRate =
      totalAssignments > 0 ? Math.round((submitted / totalAssignments) * 100) : 0;

    data.submitted = submitted;
    data.pending = pending;
    data.completionRate = completionRate;
    data.stats = [
      { label: "Total Assignments", value: totalAssignments },
      { label: "Pending Tasks", value: pending },
      { label: "Submitted", value: submitted },
      { label: "Completion Rate", value: `${completionRate}%` },
    ];
  }

  return res.json(data);
});

export default router;