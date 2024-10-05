import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import { ErrorComponent, Refine, NotificationProvider } from "@refinedev/core";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { DevtoolsProvider } from "@refinedev/devtools";
import Cookies from 'js-cookie';
import { resources, themeConfig } from "@/config";
import { dataProvider, liveProvider } from "@/providers";
import { AlgoliaSearchWrapper, FullScreenLoading, Layout } from "./components";
import { AuditLogPage, SettingsPage } from "./routes/administration";
import {
  CalendarCreatePage,
  CalendarEditPage,
  CalendarPageWrapper,
  CalendarShowPage,
} from "./routes/calendar";
import {
  CompanyCreatePage,
  CompanyEditPage,
  CompanyListPage,
} from "./routes/companies";
import {
  ContactCreatePage,
  ContactShowPage,
  ContactsListPage,
} from "./routes/contacts";
import { DashboardPage } from "./routes/dashboard";
import { ForgotPasswordPage } from "./routes/forgot-password";
import { LoginPage } from "./login";
import { RegisterPage } from "./routes/register";
import {
  QuotesCreatePage,
  QuotesEditPage,
  QuotesListPage,
  QuotesShowPage,
} from "./routes/quotes";
import {
  KanbanCreatePage,
  KanbanCreateStage,
  KanbanEditPage,
  KanbanEditStage,
  KanbanPage,
} from "./routes/scrumboard/kanban";
import {
  SalesCreatePage,
  SalesCreateStage,
  SalesEditPage,
  SalesEditStage,
  SalesFinalizeDeal,
  SalesPage,
} from "./routes/scrumboard/sales";
import { UpdatePasswordPage } from "./routes/update-password";
import "./utilities/init-dayjs";
import "@refinedev/antd/dist/reset.css";
import "./styles/antd.css";
import "./styles/fc.css";
import "./styles/index.css";
import { useAutoLoginForDemo } from './hooks';
import { useNotificationProvider } from '@refinedev/antd';
// import { MoreFiltersPanel } from "./routes/contacts/MoreFiltersPanel";

// Define a custom hook to check for authentication status
const useAuth = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user;
};

// Define a ProtectedRoute component to protect sensitive routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App: React.FC = () => {
  const { loading } = useAutoLoginForDemo();

  if (loading) {
    return <FullScreenLoading />;
  }

  return (
    (<AlgoliaSearchWrapper>
      <BrowserRouter>
        <ConfigProvider theme={themeConfig}>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider}
                liveProvider={liveProvider}
                routerProvider={routerProvider}
                resources={resources}
                notificationProvider={useNotificationProvider}
                options={{
                  liveMode: "auto",
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "gFOsGl-UO9O1p-KCo5Px"
                }}
              >
                <Routes>
                  <Route
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Outlet />
                        </Layout>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route
                      path="/calendar"
                      element={
                        <CalendarPageWrapper>
                          <Outlet />
                        </CalendarPageWrapper>
                      }
                    >
                      <Route index element={null} />
                      <Route path="show/:id" element={<CalendarShowPage />} />
                      <Route path="edit/:id" element={<CalendarEditPage />} />
                      <Route path="create" element={<CalendarCreatePage />} />
                    </Route>
                    <Route path="/scrumboard" element={<Outlet />}>
                      <Route
                        path="kanban"
                        element={
                          <KanbanPage>
                            <Outlet />
                          </KanbanPage>
                        }
                      >
                        <Route path="create" element={<KanbanCreatePage />} />
                        <Route path="edit/:id" element={<KanbanEditPage />} />
                        <Route
                          path="stages/create"
                          element={<KanbanCreateStage />}
                        />
                        <Route
                          path="stages/edit/:id"
                          element={<KanbanEditStage />}
                        />
                      </Route>
                      <Route
                        path="sales"
                        element={
                          <SalesPage>
                            <Outlet />
                          </SalesPage>
                        }
                      >
                        <Route
                          path="create"
                          element={
                            <SalesCreatePage>
                              <Outlet />
                            </SalesCreatePage>
                          }
                        >
                          <Route
                            path="company/create"
                            element={<CompanyCreatePage isOverModal />}
                          />
                        </Route>
                        <Route path="edit/:id" element={<SalesEditPage />} />
                        <Route
                          path="stages/create"
                          element={<SalesCreateStage />}
                        />
                        <Route
                          path="stages/edit/:id"
                          element={<SalesEditStage />}
                        />
                        <Route
                          path=":id/finalize"
                          element={<SalesFinalizeDeal />}
                        />
                      </Route>
                    </Route>
                    <Route
                      path="/companies"
                      element={
                        <CompanyListPage>
                          <Outlet />
                        </CompanyListPage>
                      }
                    >
                      <Route path="create" element={<CompanyCreatePage />} />
                    </Route>
                    <Route
                      path="/companies/edit/:id"
                      element={<CompanyEditPage />}
                    />
                    <Route
                      path="/contacts"
                      element={
                        <ContactsListPage />
                      }
                    >
                      <Route index element={null} />
                      <Route path="show/:id" element={<ContactShowPage />} />
                      <Route
                        path="create"
                        element={
                          <ContactCreatePage>
                            <Outlet />
                          </ContactCreatePage>
                        }
                      >
                        <Route
                          path="company-create"
                          element={<CompanyCreatePage isOverModal />}
                        />
                      </Route>
                    </Route>
                    
                    <Route
                      path="/quotes"
                      element={
                        <QuotesListPage>
                          <Outlet />
                        </QuotesListPage>
                      }
                    >
                      <Route
                        path="create"
                        element={
                          <QuotesCreatePage>
                            <Outlet />
                          </QuotesCreatePage>
                        }
                      >
                        <Route
                          path="company-create"
                          element={<CompanyCreatePage isOverModal />}
                        />
                      </Route>
                      <Route
                        path="edit/:id"
                        element={
                          <QuotesEditPage>
                            <Outlet />
                          </QuotesEditPage>}
                      >
                        <Route
                          path="company-create"
                          element={<CompanyCreatePage isOverModal />}
                        />
                      </Route>
                    </Route>
                    <Route
                      path="/quotes/show/:id"
                      element={<QuotesShowPage />}
                    />
                    <Route path="/administration" element={<Outlet />}>
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="audit-log" element={<AuditLogPage />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPasswordPage />}
                    />
                    <Route
                      path="/update-password"
                      element={<UpdatePasswordPage />}
                    />
                  </Route>
                </Routes>
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              {/* <DevtoolsPanel /> */}
            </DevtoolsProvider>
          </AntdApp>
        </ConfigProvider>
      </BrowserRouter>
    </AlgoliaSearchWrapper>)
  );
};

export default App;
