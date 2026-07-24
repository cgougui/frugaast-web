// FlatRoutes: 
// Dynamic path (catalogue.$id.jsx) not working for some reason...
// Uncomment to test (all the routes are flat route ready)
// import { flatRoutes } from "@react-router/fs-routes";

// export default flatRoutes({
//   ignoredRouteFiles: ['**/*.css'],
// });

import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.jsx"),
  
  // Main pages
  route("how-it-works", "routes/how-it-works.jsx"),
  route("setup-guide", "routes/setup-guide.jsx"),
  route("pricing", "routes/pricing.jsx"),
  route("download", "routes/download.jsx"),

  // Minor pages
  route("pro", "routes/minor/pro.jsx"),
  route("roadmap", "routes/minor/roadmap.jsx"),
  route("affiliates", "routes/minor/affiliates.jsx"),
  route("adb-setup", "routes/minor/adb-setup.jsx"),
  route("safety-tips", "routes/minor/safety-tips.jsx"),
  route("faq", "routes/minor/faq.jsx"),
  route("vs-meta-ads", "routes/minor/vs-meta-ads.jsx"),
  route("vs-cloud-bots", "routes/minor/vs-cloud-bots.jsx"),
  route("contact", "routes/minor/contact.jsx"),
  route("terms", "routes/minor/terms.jsx"),
  route("privacy", "routes/minor/privacy.jsx"),
  route("refunds", "routes/minor/refunds.jsx")
];
