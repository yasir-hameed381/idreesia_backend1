const express = require("express");
// const userRoutes = require('./user.route');
const taleemRoutes = require("./taleem.route");
const naatRoutes = require("./naat.route");
const messagesRoutes = require("./messages.route");
const mehfilsRoutes = require("./mehfils.route");
const wazaifsRoutes = require("./wazaifs.route");
// const galleryRoutes = require('./gallery.route');
const searchRoutes = require("./search.route");
const categoriesRoutes = require("./categories.route");
const tagsRoutes = require("./tags.route");
const authRoutes = require("./auth.route");
const parhaiyanRoutes = require("./parhaiyan.route");
const parhaiyanRecitaionsRoutes = require("./parhaiyan-recitations.route");
const zoneRoutes = require("./zones.route");
const mehfilDirectoryRoutes = require("./mehfil-directories.route");
const namazRoutes = require("./namaz.route");
const ehadKarkunRoutes = require("./ehadKarkun.route");
const karkunRoutes = require("./karkun.route");
const permissionRoutes = require("./permissions.route");
const rolesRoutes = require("./roles.route");
const adminUsersRoutes = require("./admin-users.route");
const feedbackRoutes = require("./feedback.route");
const karkunJoinRequestsRoute = require("./karkunJoinRequests.route");
const mehfilReportsRoute = require("./mehfil-reports.route");
const tabarukatRoute = require("./tabarukat.route");
const newKarkunRoute = require("./newKarkun.route");
const newEhadFollowUpRoute = require("./newEhadFollowUp.route");
const mehfilCoordinatorRoute = require("./mehfilCoordinator.route");
const dutyTypeRoute = require("./dutyType.route");
const dutyRosterRoute = require("./dutyRoster.route");
const dashboardRoute = require("./dashboard.route");
const { route } = require("../../Enums/routeEnums");

const router = express.Router();

router.use(route.TALEEMAT, taleemRoutes);
router.use(route.NAATSHAREEFS, naatRoutes);
router.use(route.MESSAGES, messagesRoutes);
router.use(route.MEHFILSSHAREEFS, mehfilsRoutes);
router.use(route.WAZAIFS, wazaifsRoutes);

// router.use(route.GALLERY, galleryRoutes);

router.use(route.SEARCH, searchRoutes);
router.use(route.CATEGORIES, categoriesRoutes);
router.use(route.TAGS, tagsRoutes);
router.use(route.AUTH, authRoutes);

router.use(route.PARHAIYAN, parhaiyanRoutes);

router.use(route.PARHAIYAN_RECITAION, parhaiyanRecitaionsRoutes);

router.use(route.ZONE, zoneRoutes);

router.use(route.MEHFIL_DIRECTORY, mehfilDirectoryRoutes);

router.use(route.NAMAZ, namazRoutes);

router.use(route.EHAD_KARKUN, ehadKarkunRoutes);

router.use(route.KARKUN, karkunRoutes);

router.use(route.PERMISSIONS, permissionRoutes);
router.use(route.ROLE, rolesRoutes);
router.use(route.ADMIN_USERS, adminUsersRoutes);
router.use(route.FEEDBACK, feedbackRoutes);
router.use(route.KARKUN_JOIN_REQUEST, karkunJoinRequestsRoute);
router.use(route.MEHFIL_REPORTS, mehfilReportsRoute);
router.use(route.NEW_KARKUN, newKarkunRoute);
router.use(route.Tabarukat, tabarukatRoute);
router.use(route.NEW_EHAD_FOLLOW_UP, newEhadFollowUpRoute);
router.use(route.MEHFIL_COORDINATOR, mehfilCoordinatorRoute);
router.use(route.DUTY_TYPE, dutyTypeRoute);
router.use(route.DUTY_ROSTER, dutyRosterRoute);
router.use(route.DASHBOARD, dashboardRoute);

// Health check route
router.get("/healthcheck", (req, res) => {
  res.status(200).json({ status: "OK" });
});

module.exports = router;
