import React from 'react';
import { useCmsStore } from './stores/useCmsStore';
import { Shell } from './components/layout/Shell';
import { DashboardView } from './features/dashboard/DashboardView';
import { ContentListView } from './features/content/ContentListView';
import { ContentEditorView } from './features/content/ContentEditorView';
import { ContentTypesView } from './features/content-types/ContentTypesView';
import { MediaLibraryView } from './features/media/MediaLibraryView';
import { PagesNavigationView } from './features/pages/PagesNavigationView';
import { WorkflowQueueView } from './features/workflow/WorkflowQueueView';
import { UserManagementView } from './features/users/UserManagementView';
import { RolesPermissionsView } from './features/roles/RolesPermissionsView';
import { AuditLogView } from './features/activity/AuditLogView';
import { NotificationsView } from './features/notifications/NotificationsView';
import { SettingsView } from './features/settings/SettingsView';

export default function App() {
  const { activeRoute } = useCmsStore();

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <DashboardView />;
      case 'content':
        return <ContentListView />;
      case 'editor':
        return <ContentEditorView />;
      case 'content-types':
        return <ContentTypesView />;
      case 'media':
        return <MediaLibraryView />;
      case 'pages':
      case 'navigation':
        return <PagesNavigationView />;
      case 'workflow':
        return <WorkflowQueueView />;
      case 'users':
        return <UserManagementView />;
      case 'roles':
        return <RolesPermissionsView />;
      case 'activity':
        return <AuditLogView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Shell>
      {renderActiveView()}
    </Shell>
  );
}
