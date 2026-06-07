const { execSync } = require('child_process');

const components = [
  'layouts/auth-layout',
  'features/auth/login',
  'features/auth/role-select',
  'layouts/main-layout',
  'layouts/main-layout/sidebar',
  'layouts/main-layout/header',
  'layouts/mobile-layout',
  'layouts/mobile-layout/bottom-nav',
  'layouts/mobile-layout/mobile-header',
  'layouts/print-layout',
  'shared/components/page-header',
  'shared/components/stat-card',
  'shared/components/status-badge',
  'shared/components/avatar',
  'shared/components/empty-state',
  'shared/components/skeleton-loader',
  'shared/components/notification-panel',
  'shared/components/search-bar',
  'shared/components/theme-toggle',
  'shared/components/breadcrumb'
];

const services = [
  'core/services/breadcrumb'
];

for (const comp of components) {
  console.log(`Generating component ${comp}...`);
  try {
    execSync(`npx ng generate component ${comp} --skip-tests`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Error generating ${comp}`, e);
  }
}

for (const srv of services) {
  console.log(`Generating service ${srv}...`);
  try {
    execSync(`npx ng generate service ${srv} --skip-tests`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Error generating ${srv}`, e);
  }
}
